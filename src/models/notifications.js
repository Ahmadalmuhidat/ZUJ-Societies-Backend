const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  ID: { type: String, unique: true, required: true },
  User: { type: String, required: true }, // User.ID who should receive the notification
  Type: { 
    type: String, 
    required: true,
    enum: ['like', 'comment', 'join_request', 'join_approved', 'join_rejected', 'new_event', 'post']
  },
  Title: { type: String, required: true },
  Message: { type: String, required: true },
  Data: { type: Object, default: {} }, // Additional data like postId, societyId, etc.
  Read: { type: Boolean, default: false },
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);


