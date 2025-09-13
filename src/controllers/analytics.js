const User = require('../models/users');
const Post = require('../models/posts');
const Event = require('../models/events');
const Society = require('../models/societies');
const Comment = require('../models/comments');

// Get platform analytics
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error_message: "Token required" });
    }

    // Get counts
    const [
      totalUsers,
      totalSocieties,
      totalPosts,
      totalEvents,
      totalComments
    ] = await Promise.all([
      User.countDocuments(),
      Society.countDocuments(),
      Post.countDocuments(),
      Event.countDocuments(),
      Comment.countDocuments()
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = await Post.countDocuments({
      CreatedAt: { $gte: sevenDaysAgo }
    });

    const recentEvents = await Event.countDocuments({
      CreatedAt: { $gte: sevenDaysAgo }
    });

    const recentSocieties = await Society.countDocuments({
      CreatedAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      data: {
        totalUsers,
        totalSocieties,
        totalPosts,
        totalEvents,
        totalComments,
        recentActivity: {
          posts: recentPosts,
          events: recentEvents,
          societies: recentSocieties
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to fetch analytics" });
  }
};

// Get trending posts
exports.getTrendingPosts = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error_message: "Token required" });
    }

    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    // Get posts with engagement (likes + comments) from last N days
    const posts = await Post.find({
      CreatedAt: { $gte: daysAgo }
    })
    .sort({ Likes: -1, CommentsCount: -1 })
    .limit(limit);

    // Transform posts to include engagement score
    const trendingPosts = posts.map(post => ({
      ID: post.ID,
      Content: post.Content,
      Likes: post.Likes || 0,
      CommentsCount: post.CommentsCount || 0,
      Image: post.Image,
      CreatedAt: post.CreatedAt,
      engagement: (post.Likes || 0) + (post.CommentsCount || 0),
      User_Name: 'User', // Will be populated by frontend
      User_Image: 'https://cdn-icons-png.flaticon.com/512/4537/4537019.png',
      Society_Name: 'Society', // Will be populated by frontend
      User: post.User,
      Society: post.Society
    }));

    res.status(200).json({ data: trendingPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to fetch trending posts" });
  }
};

// Get activity feed
exports.getActivityFeed = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error_message: "Token required" });
    }

    const limit = parseInt(req.query.limit) || 20;
    const userId = req.query.user_id; // Optional: filter by user

    const activities = [];

    // Get recent posts without populate to avoid schema issues
    const recentPosts = await Post.find({})
      .sort({ CreatedAt: -1 })
      .limit(5);

    recentPosts.forEach(post => {
      activities.push({
        id: `post-${post.ID}`,
        type: 'post',
        user: 'User', // Will be populated by frontend
        action: 'created a new post',
        target: 'Society', // Will be populated by frontend
        time: post.CreatedAt,
        avatar: 'https://cdn-icons-png.flaticon.com/512/4537/4537019.png',
        data: {
          postId: post.ID,
          content: post.Content,
          userId: post.User,
          societyId: post.Society
        }
      });
    });

    // Get recent events without populate
    const recentEvents = await Event.find({})
      .sort({ CreatedAt: -1 })
      .limit(3);

    recentEvents.forEach(event => {
      activities.push({
        id: `event-${event.ID}`,
        type: 'event',
        user: 'User', // Will be populated by frontend
        action: 'created an event',
        target: event.Title,
        time: event.CreatedAt,
        avatar: 'https://cdn-icons-png.flaticon.com/512/4537/4537019.png',
        data: {
          eventId: event.ID,
          title: event.Title,
          userId: event.User,
          societyId: event.Society
        }
      });
    });

    // Get recent societies without populate
    const recentSocieties = await Society.find({})
      .sort({ CreatedAt: -1 })
      .limit(2);

    recentSocieties.forEach(society => {
      activities.push({
        id: `society-${society.ID}`,
        type: 'society',
        user: 'User', // Will be populated by frontend
        action: 'created a society',
        target: society.Name,
        time: society.CreatedAt,
        avatar: 'https://cdn-icons-png.flaticon.com/512/4537/4537019.png',
        data: {
          societyId: society.ID,
          name: society.Name,
          userId: society.User
        }
      });
    });

    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({ data: limitedActivities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to fetch activity feed" });
  }
};

// Get user recommendations
exports.getUserRecommendations = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error_message: "Token required" });
    }

    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error_message: "User ID required" });
    }

    // Get user's current societies (assuming they're stored in a Members array or similar)
    // For now, we'll get all societies and filter based on user's interests
    const allSocieties = await Society.find({});
    const userSocietyIds = []; // This would need to be populated based on actual membership logic
    
    // Get user's interests (from society categories) - for now, use all categories
    const userCategories = [...new Set(allSocieties.map(s => s.Category).filter(Boolean))];

    // Recommend societies based on categories
    const recommendedSocieties = await Society.find({
      ID: { $nin: userSocietyIds },
      Category: { $in: userCategories }
    }).limit(3);

    // Recommend events from all societies
    const recommendedEvents = await Event.find({}).limit(2);

    const recommendations = [];

    recommendedSocieties.forEach(society => {
      recommendations.push({
        id: society.ID,
        type: 'society',
        title: society.Name,
        description: society.Description,
        reason: `Similar to your interests in ${society.Category}`,
        members: society.Member_Count || 0,
        category: society.Category,
        image: society.Image
      });
    });

    recommendedEvents.forEach(event => {
      recommendations.push({
        id: event.ID,
        type: 'event',
        title: event.Title,
        description: event.Description,
        reason: 'From your societies',
        date: event.Date,
        time: event.Time,
        location: event.Location,
        image: event.Image
      });
    });

    res.status(200).json({ data: recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to fetch recommendations" });
  }
};
