const Event = require("../models/events");
const User = require("../models/users");
const SocietyMember = require("../models/societyMembers");
const { v4: uuidv4 } = require("uuid");
const jsonWebToken = require("../helper/json_web_token");
const mailer = require("../services/mailer");

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}, "-_id -__v").lean();
    res.status(200).json({ data: events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Events" });
  }
};

exports.getEventInfo = async (req, res) => {
  try {
    const event = await Event.findOne({ ID: req.query.event_id }).lean();
    if (!event) return res.status(404).json({ error_message: "Event not found" });

    const organizer = await User.findOne({ ID: event.User }).select("Name").lean();
    res.status(200).json({ data: { ...event, Organizer: organizer?.Name || null } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Event info" });
  }
};

exports.searchEvent = async (req, res) => {
  try {
    const regex = new RegExp(req.query.search_term, "i"); // case-insensitive search
    const events = await Event.find({ Title: regex }).lean();
    res.status(200).json({ data: events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to search events" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const userId = jsonWebToken.verify_token(req.body.token)['id'];
    const newEventId = uuidv4();

    const newEvent = new Event({
      ID: newEventId,
      Title: req.body.title,
      Description: req.body.description,
      Date: req.body.date,
      Time: req.body.time,
      User: userId,
      Society: req.body.society_id,
      Location: req.body.location,
      Image: req.body.image,
      Category: req.body.category
    });

    await newEvent.save();

    // Notify society members by email
    const members = await SocietyMember.find({ Society: req.body.society_id }).select("User").lean();
    const userIds = members.map(m => m.User);
    const users = await User.find({ ID: { $in: userIds } }).select("Email").lean();

    users.forEach(u => {
      mailer.sendEmail(u.Email, "New Event", "Welcome to new event");
    });

    res.status(201).json({ data: newEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const result = await Event.deleteOne({ ID: req.query.event_id });
    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete event" });
  }
};

exports.getEventsBySociety = async (req, res) => {
  try {
    const events = await Event.find({ Society: req.query.society_id }).lean();

    // Populate organizer names manually
    const userIds = events.map(e => e.User);
    const users = await User.find({ ID: { $in: userIds } }).select("ID Name").lean();

    const result = events.map(event => {
      const organizer = users.find(u => u.ID === event.User);
      return {
        ...event,
        Organizer: organizer?.Name || null
      };
    });

    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Events for this society" });
  }
};
