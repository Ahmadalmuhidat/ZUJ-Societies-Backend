const pool = require("../config/database");

exports.get_events = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT ID, Title, Description, Date, Time, User, Society FROM Events");
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get events" });
  }
};

exports.create_event = async (req, res) => {
  const sqlQuery = "INSERT INTO Events (ID, Title, Description, Date, Time, User, Society) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const data = [req.body.id, req.body.title, req.body.description, req.body.date, req.body.time, req.body.user, req.body.society];

  try {
    const [results] = await pool.query(sqlQuery, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create event" });
  }
};

exports.get_events_by_society = async (req, res) => {
  const society_id = req.params.society_Id;

  try {
    const [rows] = await pool.query("SELECT ID, Title, Description, Date, Time, User, Society FROM Events WHERE Society = ?", [society_id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error_message: "No events found for this society" });
    }

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get events for this society" });
  }
};