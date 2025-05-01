const pool = require("../config/database");
const mailer = require("../services/mailer");

exports.get_users = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Name
      FROM
        Users
    `
    const [rows] = await pool.query(sql_query);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get users" });
  }
};

exports.create_user = async (req, res) => {
  try {
    const sql_query = `
      INSERT INTO
        Users
      VALUES
      (
        ?,
        ?
      )
    `;
    const data = [req.body.name, req.body.email];

    mailer.send_email(req.body.email, "welcone to zuj societies", "welcome");

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create user" });
  }
};
