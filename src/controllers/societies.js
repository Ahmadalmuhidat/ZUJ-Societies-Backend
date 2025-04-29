const pool = require("../config/database");

exports.get_societies = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT ID, Name, Description, User FROM Societies");
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get societies" });
  }
};

exports.create_society = async (req, res) => {
  try {
    const sqlQuery = "INSERT INTO Societies (ID, Name, Description, User) VALUES (?, ?, ?, ?)";
    const data = [req.body.id, req.body.name, req.body.description, req.body.user];

    const [results] = await pool.query(sqlQuery, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create society" });
  }
};

exports.get_societies_by_user = async (req, res) => {
  try {
    const userId = req.params.user_id;

    const [rows] = await pool.query("SELECT ID, Name, Description, User FROM Societies WHERE User = ?", [userId]);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get societies for the user" });
  }
};

exports.search_society = async (req, res) => {
  try {
    const society_name = req.params.name;

    const [rows] = await pool.query("SELECT ID, Name, Description, User FROM Societies WHERE ID = ?", [society_name]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error_message: "Society not found" });
    }

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get society" });
  }
};