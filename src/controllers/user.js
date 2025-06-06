const pool = require("../config/database");
const json_web_token = require("../helper/json_web_token")

exports.get_user_info = async (req, res) => {
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
    const [rows] = await pool.query(sql_query, [json_web_token.verify_token(req.query.token)['id']]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get users" });
  }
};

exports.get_user_profile_info = async (req, res) => {
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
    const [rows] = await pool.query(sql_query, [json_web_token.verify_token(req.query.token)['id']]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get user profile" });
  }
};