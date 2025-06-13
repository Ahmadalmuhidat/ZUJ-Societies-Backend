const pool = require("../config/database");
const jsonWebToken = require("../helper/json_web_token")

exports.getUserInformation = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Name,
        Email
      FROM
        Users
      WHERE
        ID = ?
    `
    const [rows] = await pool.query(sql_query, [jsonWebToken.verify_token(req.query.token)['id']]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Users" });
  }
};

exports.getUserProfileInformation = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        Users.ID,
        Users.Name,
        Users.Email,
        Users.Phone_Number,
        Users.Bio,
        Users.Photo,
        Users.Create_Date,
        (SELECT COUNT(*) FROM Societies WHERE Societies.User = Users.ID) AS Society_Count,
        (SELECT COUNT(*) FROM Posts WHERE Posts.User = Users.ID) AS Post_Count,
        (SELECT COUNT(*) FROM Events WHERE Events.User = Users.ID) AS Event_Count
      FROM
        Users
      WHERE
        Users.ID = ?
    `
    const [rows] = await pool.query(sql_query, [jsonWebToken.verify_token(req.query.token)['id']]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get User profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const sql_query = `
      UPDATE
        Users
      SET
        Name = ?,
        Email = ?,
        Phone_Number = ?,
        Bio = ?
      WHERE
        Users.ID = ?
    `
    const data = [
      req.body.name,
      req.body.email,
      req.body.phone,
      req.body.bio,
      jsonWebToken.verify_token(req.body.token)['id']
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get User profile" });
  }
};