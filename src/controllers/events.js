const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const mailer = require("../services/mailer")
const jsonWebToken = require("../helper/json_web_token")

exports.getAllEvents = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Title,
        Description,
        Date,
        Time,
        Category,
        Location,
        Image        
      FROM
        Events
    `;
    const [rows] = await pool.query(sql_query);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get events" });
  }
};

exports.getEventInfo = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        Events.ID,
        Events.Title,
        Events.Description,
        Events.Date,
        Events.Time,
        Events.Category,
        Events.Location,
        Events.Image,
        Users.Name AS Organizer
      FROM
        Events
      JOIN
        Users
      ON
        Users.ID = Events.User
      WHERE
        Events.ID = ?
    `;
    const data = [req.query.event_id];
    const [rows] = await pool.query(sql_query, data);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get events for this society" });
  }
};

exports.searchEvent = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Title,
        Description,
        Date,
        Time,
        Category,
        Location,
        Image        
      FROM
        Events
      WHERE
        Title = ?
    `;
    const data = [req.query.search_term];
    const [rows] = await pool.query(sql_query, data);
    res.status(201).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get events" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    console.log(req.body)
    const sql_query = `
      INSERT INTO
        Events
      VALUES
      (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `;
    const data = [
      uuidv4(),
      req.body.title,
      req.body.description,
      req.body.date,
      req.body.time,
      jsonWebToken.verify_token(req.body.token)['id'],
      req.body.society_id,
      req.body.location,
      req.body.image,
      req.body.category
    ];
    const [results] = await pool.query(sql_query, data);
    if (results) {
      const sql_query = `
        SELECT
          Users.Email
        FROM
          societies_memebers
        LEFT JOIN
          Users
        ON
          Users.ID = societies_memebers.User
        WHERE
          Society = ?
      `;
      const data = [req.body.society_id];
      const [results] = await pool.query(sql_query, data);

      if (results.length > 0) {
        results.forEach((user) => {
          mailer.sendEmail(user.Email, "New Event", "welcone to new event");
        })
      }
    }
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const sql_query = `
      DELETE FROM
        Events
      WHERE
        ID = ?
    `;
    const data = [
      req.query.event_id
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete post" });
  }
};

exports.getEventsBySociety = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        Events.ID,
        Events.Image,
        Events.Title,
        Events.Description,
        Events.Location,
        Events.Date,
        Events.Time,
        Users.Name AS Organizer
      FROM
        Events
      JOIN
        Users
      ON
        Events.User = Users.ID
      WHERE
        Events.Society = ?
    `;
    const data = [req.query.society_id];
    const [rows] = await pool.query(sql_query, data);
    res.status(201).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get events for this society" });
  }
};