const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  ID: { type: String, unique: true, required: true },
  Type: { type: String, enum: ["post", "event"], required: true },
  ReferenceID: { type: String, required: true },  // ID of post or event
  User: { type: String, required: true },         // user who reported
  Reason: String,
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
