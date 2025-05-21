const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const mailer = require("../services/mailer")

exports.get_all_events = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Title,
        Description,
        Date,
        Time,
        User,
        Society
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

exports.create_event = async (req, res) => {
  try {
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
        ?
      )
    `;
    const data = [
      uuidv4(),
      req.body.title,
      req.body.description,
      req.body.date,
      req.body.time,
      req.body.user_id,  // fix: get from token
      req.body.society_id
    ];
    const [results] = await pool.query(sql_query, data);
    if (results) {
      const sql_query = `
        SELECT
          Users.Email
        FROM
          societies_members
        LEFT JOIN
          Users
        ON
          Users.ID = societies_members.User
        WHERE
          Society = ?
      `;
      const data = [req.body.society];
      const [results] = await pool.query(sql_query, data);

      if (results.length > 0) {
        results.forEach((user) => {
          mailer.send_email(user.Email, "New Event", "welcone to new event");
        })
      }
    }
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create event" });
  }
};

exports.delete_event = async (req, res) => {
  try {
    const sql_query = `
      DELETE FROM
        Events
      WHERE
        ID = ?
    `;
    const data = [
      req.params.event_id
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete post" });
  }
};

exports.get_events_by_society = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Title,
        Description,
        Date,
        Time,
        User,
        Society
      FROM
        Events
      WHERE
        Society = ?
    `;
    const data = [society_id];
    const society_id = req.params.society_id;
    const [rows] = await pool.query(sql_query, data);

    if (rows.length === 0) {
      return res.status(404).json({ error_message: "No events found for this society" });
    }

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get events for this society" });
  }
};