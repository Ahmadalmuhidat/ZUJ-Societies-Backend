const mongoose = require("mongoose");

const eventAttendanceSchema = new mongoose.Schema({
  ID: { type: String, unique: true, required: true },
  Event: { type: String, required: true }, // Event ID
  User: { type: String, required: true }, // User ID
  Status: { 
    type: String, 
    enum: ['attending', 'interested', 'not_attending'], 
    default: 'interested' 
  },
  CreatedAt: { type: Date, default: Date.now },
  UpdatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one record per user per event
eventAttendanceSchema.index({ Event: 1, User: 1 }, { unique: true });

module.exports = mongoose.model("EventAttendance", eventAttendanceSchema);
