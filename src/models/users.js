const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  ID: { type: String, unique: true }, // UUID
  Name: String,
  Email: { type: String, unique: true },
  Password: String,
  StudentID: String,
  Photo: String,
  Bio: String,
  PhoneNumber: String,
  CreatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
