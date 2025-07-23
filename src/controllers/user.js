const User = require("../models/users");
const Post = require("../models/posts");
const Event = require("../models/events");
const Society = require("../models/societies");
const jsonWebToken = require("../helper/json_web_token");

exports.getUserInformation = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.query.token)['id'];
    const user = await User.findOne({ ID: userId }, 'ID Name Email');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(201).json({ data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get User" });
  }
};

exports.getUserProfileInformation = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.query.token)['id'];
    const user = await User.findOne({ ID: userId }, 'ID Name Email PhoneNumber Bio Photo CreatedAt');

    if (!user) return res.status(404).json({ error: "User not found" });

    const [postCount, eventCount, societyCount] = await Promise.all([
      Post.countDocuments({ User: userId }),
      Event.countDocuments({ User: userId }),
      Society.countDocuments({ User: userId })
    ]);

    res.status(201).json({
      data: {
        ...user.toObject(),
        Post_Count: postCount,
        Event_Count: eventCount,
        Society_Count: societyCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get User profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.body.token)['id'];
    const updateData = {
      Name: req.body.name,
      Email: req.body.email,
      PhoneNumber: req.body.phone,
      Bio: req.body.bio
    };

    const result = await User.findOneAndUpdate({ ID: userId }, updateData, { new: true });

    if (!result) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to update User profile" });
  }
};
