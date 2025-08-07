const Comment = require("../models/comments");
const User = require("../models/users");
const { v4: uuidv4 } = require("uuid");
const jsonWebToken = require("../helper/json_web_token");

exports.createComment = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.body.token)['id'];

    const newComment = new Comment({
      ID: uuidv4(),
      Content: req.body.content,
      Post: req.body.post_id,
      User: userId
    });

    await newComment.save();
    res.status(201).json({ data: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create comment" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const result = await Comment.deleteOne({ ID: req.query.comment_id });
    res.status(204).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete comment" });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    // Get all comments for the post
    const comments = await Comment.find({ Post: req.query.post_id }).lean();

    // Extract user IDs to fetch user details
    const userIds = comments.map(c => c.User);
    const users = await User.find({ ID: { $in: userIds } }).select("ID Name Photo").lean();

    // Map user info to comments
    const data = comments.map(comment => {
      const user = users.find(u => u.ID === comment.User) || {};
      return {
        ID: comment.ID,
        Content: comment.Content,
        User_Name: user.Name || null,
        User_Photo: user.Photo || null
      };
    });

    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Comments for this post" });
  }
};
