const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  ID: { type: String, unique: true },
  User: String,    // User.ID reference
  Post: String,    // Post.ID reference
  CreatedAt: { type: Date, default: Date.now }
});

// Create compound unique index to prevent duplicate likes from same user on same post
likeSchema.index({ User: 1, Post: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
