const User = require("../models/users");
const passwords_helper = require("../helper/passwords");
const jsonWebToken = require("../helper/json_web_token");
const { v4: uuidv4 } = require("uuid");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.query;

    const user = await User.findOne({ Email: email });
    if (!user) return res.status(404).json({ error_message: "User not found" });

    const isPasswordCorrect = await passwords_helper.verify_password(password, user.Password);
    if (!isPasswordCorrect) return res.status(401).json({ error_message: "Password is incorrect" });

    const token = jsonWebToken.generate_token({
      id: user.ID,
      name: user.Name,
      email: user.Email
    });

    return res.status(200).json({ data: token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const studentId = req.body.student_id;
    const enrollmentYear = parseInt(studentId.toString().substring(0, 4), 10);
    const currentYear = new Date().getFullYear();

    if (currentYear - enrollmentYear > 7) {
      return res.status(400).json({ error_message: "Student ID is older than 7 years" });
    }

    const newUser = new User({
      ID: uuidv4(),
      Name: req.body.name,
      Email: req.body.email,
      Password: await passwords_helper.hash_password(req.body.password),
      StudentID: studentId,
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

