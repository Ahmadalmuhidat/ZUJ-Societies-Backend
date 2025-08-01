const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  ID: { type: String, unique: true },
  User: String,    // User.ID reference
  Post: String,    // Post.ID reference
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Like', likeSchema);
