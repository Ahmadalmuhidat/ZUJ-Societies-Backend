const mongoose = require('mongoose');

const societyInviteSchema = new mongoose.Schema({
  ID: { type: String, unique: true },
  Society: String, // society ID
  Inviter: String, // user ID of the person sending the invite
  Invitee: String, // user ID of the person being invited
  Status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SocietyInvite', societyInviteSchema);
