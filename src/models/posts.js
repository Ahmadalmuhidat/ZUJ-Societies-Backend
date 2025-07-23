const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  ID: { type: String, unique: true },
  Content: String,
  Image: String,
  User: String,       // User.ID reference
  Society: String,    // Society.ID reference
  LikesCount: { type: Number, default: 0 },
  CommentsCount: { type: Number, default: 0 },
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
