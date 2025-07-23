const User = require("../models/users");
const mailer = require("../services/mailer");
const passwords_helper = require("../helper/passwords");
const jsonWebToken = require("../helper/json_web_token");
const { v4: uuidv4 } = require("uuid");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.query;

    const user = await User.findOne({ Email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordCorrect = await passwords_helper.verify_password(password, user.Password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Password is incorrect" });
    }

    const token = jsonWebToken.generate_token({
      id: user.ID,
      name: user.Name,
      email: user.Email
    });

    return res.status(201).json({ data: token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const newUser = new User({
      ID: uuidv4(),
      Name: req.body.name,
      Email: req.body.email,
      Password: await passwords_helper.hash_password(req.body.password),
      StudentID: req.body.student_id,
      Photo: req.body.photo,
      Bio: req.body.bio,
      PhoneNumber: req.body.phone_number || "0000",
      CreatedAt: new Date()
    });

    const savedUser = await newUser.save();
    res.status(201).json({ data: savedUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create User" });
  }
};
