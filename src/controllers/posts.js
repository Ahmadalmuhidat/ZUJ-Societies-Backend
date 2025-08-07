const Like = require('../models/likes');
const Post = require('../models/posts');
const User = require("../models/users");
const Society = require("../models/societies");
const Comment = require('../models/comments');
const SocietyMember = require("../models/societyMembers");
const { v4: uuidv4 } = require("uuid");
const jsonWebToken = require("../helper/json_web_token");

exports.getAllPosts = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ error_message: "Missing token" });

    let userId;
    try {
      userId = jsonWebToken.verify_token(token)['id'];
    } catch {
      return res.status(401).json({ error_message: "Invalid token" });
    }

    const societyMemberships = await SocietyMember.find({ User: userId }).select("Society");
    const societyIds = societyMemberships.map(m => m.Society);

    const posts = await Post.find({ Society: { $in: societyIds } }).lean();
    const userIds = [...new Set(posts.map(p => p.User.toString()))];
    const postIds = posts.map(p => p.ID);

    const [users, societies, likes] = await Promise.all([
      User.find({ ID: { $in: userIds } }).select("ID Name Photo").lean(),
      Society.find({ ID: { $in: societyIds } }).select("ID Name").lean(),
      Like.find({ User: userId, Post: { $in: postIds } }).select("Post").lean()
    ]);

    const postsWithDetails = posts.map(post => {
      const postUser = users.find(u => u.ID === post.User);
      const postSociety = societies.find(s => s.ID === post.Society);
      const isLiked = likes.some(l => l.Post === post.ID);

      return {
        ID: post.ID,
        Content: post.Content || "",
        Likes: post.LikesCount || 0,
        Image: post.Image || "",
        Comments: post.CommentsCount || 0,
        Society_Name: postSociety?.Name || null,
        User: post.User,
        User_Name: postUser?.Name || null,
        User_Image: postUser?.Photo || null,
        Is_Liked: isLiked ? 1 : 0
      };
    });

    return res.status(200).json({ data: postsWithDetails });
  } catch (err) {
    console.error("Error in getAllPosts:", err);
    return res.status(500).json({ error_message: "Failed to get Posts" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { society_id, content, image, token } = req.body;

    const decoded = jsonWebToken.verify_token(token);
    const userId = decoded.id;

    const society = await Society.findOne({ ID: society_id });
    if (!society) {
      return res.status(404).json({ error_message: 'Society not found' });
    }

    const whoCanPost = society.Permissions?.whoCanPost || 'all-members';
    const membership = await SocietyMember.findOne({ Society: society_id, User: userId });
    const userRole = membership?.Role;

    const isAllowedToPost =
      (whoCanPost === 'all-members') ||
      (whoCanPost === 'moderators' && ['moderator', 'admin'].includes(userRole)) ||
      (whoCanPost === 'admins' && userRole === 'admin');

    if (!isAllowedToPost) {
      return res.status(403).json({ error_message: 'You do not have permission to post in this society.' });
    }

    const post = new Post({
      ID: uuidv4(),
      Content: content,
      Image: image,
      User: userId,
      Society: society_id,
      LikesCount: 0,
      CommentsCount: 0,
      CreatedAt: new Date()
    });

    await post.save();

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error_message: 'Internal server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { post_id, token } = req.query;
    const userId = jsonWebToken.verify_token(token)['id'];

    const post = await Post.findOne({ ID: post_id });
    if (!post || post.User !== userId) {
      return res.status(403).json({ error_message: "Not authorized to delete this post" });
    }

    await Post.deleteOne({ ID: post_id });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete post" });
  }
};

exports.getPostsBySociety = async (req, res) => {
  try {
    // Assume token passed in query or headers
    const token = req.query.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error_message: "Missing token" });

    const userId = jsonWebToken.verify_token(token).id;

    const societyId = req.query.society_id;
    if (!societyId) return res.status(400).json({ error_message: "Missing society_id" });

    // Fetch posts in society
    const posts = await Post.find({ Society: societyId });

    // Collect unique user IDs from posts
    const userIds = [...new Set(posts.map(p => p.User.toString()))];

    // Fetch users
    const users = await User.find({ ID: { $in: userIds } }).select("ID Name Photo").lean();

    // Post IDs
    const postIds = posts.map(p => p._id.toString());

    // Fetch likes for these posts by current user & all users
    const likes = await Like.find({ Post: { $in: postIds } }).lean();
    const userLikes = new Set(
      likes.filter(like => like.User.toString() === userId).map(like => like.Post.toString())
    );

    // Build response
    const postsWithDetails = posts.map(post => {
      const postUser = users.find(u => u._id.toString() === post.User.toString());
      const likeCount = likes.filter(like => like.Post.toString() === post._id.toString()).length;
      const isLiked = userLikes.has(post._id.toString()) ? 1 : 0;

      return {
        ID: post._id.toString(),
        Content: post.Content,
        Likes: likeCount,
        Image: post.Image || "",
        Comments: post.CommentsCount || 0,
        User: post.User.toString(),
        User_Name: postUser?.Name || null,
        User_Image: postUser?.Photo || null,
        Is_Liked: isLiked
      };
    });

    res.status(200).json({ data: postsWithDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Posts for this society" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.body.token)['id'];
    const postId = req.body.post_id;

    const existingLike = await Like.findOne({ User: userId, Post: postId });
    if (existingLike) return res.status(400).json({ error_message: "User already liked this post" });

    const newLike = new Like({ ID: uuidv4(), User: userId, Post: postId });
    await newLike.save();

    await Post.updateOne({ ID: postId }, { $inc: { LikesCount: 1 } });

    res.status(201).json({ data: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to like post" });
  }
};

exports.getCommentsForPost = async (req, res) => {
  try {
    const postId = req.query.post_id;

    const comments = await Comment.find({ Post: postId })
      .sort({ CreatedAt: -1 })
      .lean();

    res.status(200).json({ data: comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get comments" });
  }
};
