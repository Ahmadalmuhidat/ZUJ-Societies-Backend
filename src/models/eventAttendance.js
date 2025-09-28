const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const eventAttendanceSchema = new mongoose.Schema({
  ID: { 
    type: String, 
    unique: true, 
    required: true,
    default: function() { return uuidv4(); }
  },
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

// Pre-save hook to ensure ID is generated (backup for safety)
eventAttendanceSchema.pre('save', function(next) {
  if (!this.ID) {
    this.ID = uuidv4();
  }
  next();
});

// Compound index to ensure one record per user per event
eventAttendanceSchema.index({ Event: 1, User: 1 }, { unique: true });

module.exports = mongoose.model("EventAttendance", eventAttendanceSchema);
