const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  ID: { type: String, unique: true },
  Post: String,    // Post.ID reference
  User: String,    // User.ID reference
  Content: String,
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
