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
    const userId = jsonWebToken.verify_token(req.query.token)['id'];

    // Find societies this user is member of
    const societies = await SocietyMember.find({ User: userId }).select("Society");
    const societyIds = societies.map(s => s.Society);

    // Find posts in those societies
    const posts = await Post.find({ Society: { $in: societyIds } }).lean();

    // Populate user info & society name
    // Since Post only stores IDs, we need to populate User and Society details
    // For performance, fetch users and societies separately
    const userIds = [...new Set(posts.map(p => p.User))];
    const users = await User.find({ ID: { $in: userIds } }).select("ID Name Photo");
    const societiesData = await Society.find({ ID: { $in: societyIds } }).select("ID Name");

    // Find likes for this user on these posts
    const postIds = posts.map(p => p.ID);
    const likes = await Like.find({ User: userId, Post: { $in: postIds } }).select("Post");

    // Build response
    const postsWithDetails = posts.map(post => {
      const postUser = users.find(u => u.ID === post.User);
      const postSociety = societiesData.find(s => s.ID === post.Society);
      const isLiked = likes.some(l => l.Post === post.ID);

      return {
        ID: post.ID,
        Content: post.Content,
        Likes: post.Likes,
        Image: post.Image,
        Comments: post.Comments,
        Society_Name: postSociety?.Name || null,
        User: post.User,
        User_Name: postUser?.Name || null,
        User_Image: postUser?.Photo || null,
        Is_Liked: isLiked ? 1 : 0
      };
    });

    res.status(200).json({ data: postsWithDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Posts" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { Society: societyId, Content, token } = req.body;

    // Verify token and get user ID
    const decoded = jsonWebToken.verify_token(token);
    const userId = decoded.id;

    // Fetch the society
    const society = await Society.findOne({ ID: societyId });
    if (!society) {
      return res.status(404).json({ error_message: 'Society not found' });
    }

    // Check who can post
    const whoCanPost = society.Permissions?.whoCanPost || 'all-members';

    // Get user role in this society
    const membership = await SocietyMember.findOne({ Society: societyId, User: userId });
    const userRole = membership?.Role;

    const isAllowedToPost =
      (whoCanPost === 'all-members') ||
      (whoCanPost === 'moderators' && ['moderator', 'admin'].includes(userRole)) ||
      (whoCanPost === 'admins' && userRole === 'admin');

    if (!isAllowedToPost) {
      return res.status(403).json({ error_message: 'You do not have permission to post in this society.' });
    }

    // Create the post
    const post = new Post({
      ID: uuidv4(),
      Content,
      User: userId,
      Society: societyId,
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
    const postId = req.query.post_id;
    const post = await Post.findOne({ ID: postId });
    if (!post || post.User !== userId) {
      return res.status(403).json({ error_message: "Not authorized to delete this post" });
    }

    const deleted = await Post.deleteOne({ ID: postId });
    res.status(200).json({ data: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete post" });
  }
};

exports.getPostsBySociety = async (req, res) => {
  try {
    const societyId = req.query.society_id;

    const posts = await Post.find({ Society: societyId });

    const userIds = [...new Set(posts.map(p => p.User))];
    const users = await User.find({ ID: { $in: userIds } }).select("ID Name Photo");

    // You might want to get likes count and if user liked
    // For now, just include if post is liked by anyone (simplify)
    const postIds = posts.map(p => p.ID);
    const likes = await Like.find({ Post: { $in: postIds } }).select("Post User");

    const postsWithDetails = posts.map(post => {
      const postUser = users.find(u => u.ID === post.User);
      // You could also filter likes by current user if you want
      return {
        ID: post.ID,
        Content: post.Content,
        Likes: post.Likes,
        Image: post.Image,
        Comments: post.Comments,
        User: post.User,
        User_Name: postUser?.Name || null,
        User_Image: postUser?.Photo || null,
        // Optionally add Is_Liked if you have current user context
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

    // Increment likes count on post
    await Post.updateOne({ ID: postId }, { $inc: { LikesCount: 1 } });

    res.status(200).json({ data: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to like post" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.body.token)['id'];
    const postId = req.body.post_id;
    const content = req.body.content;

    const newComment = new Comment({
      ID: uuidv4(),
      Post: postId,
      User: userId,
      Content: content
    });
    await newComment.save();

    // Increment comments count on post
    await Post.updateOne({ ID: postId }, { $inc: { CommentsCount: 1 } });

    res.status(201).json({ data: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to add comment" });
  }
};

exports.getCommentsForPost = async (req, res) => {
  try {
    const postId = req.query.post_id;

    const comments = await Comment.find({ Post: postId })
      .sort({ CreatedAt: -1 }) // recent first
      .lean();

    res.status(200).json({ data: comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get comments" });
  }
};