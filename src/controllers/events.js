const pool = require("../config/database");

exports.get_events = async (req, res) => {
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
      req.body.id,
      req.body.title,
      req.body.description,
      req.body.date,
      req.body.time,
      req.body.user,
      req.body.society
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create event" });
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
    const society_id = req.params.society_Id;
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