const pool = require("../config/database");
const jsonWebToken = require("../helper/json_web_token")
const { v4: uuidv4 } = require("uuid");

exports.CreateTicket = async (req, res) => {
  try {
    const sql_query = `
        INSERT INTO
          Support
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `;
    const data = [
      uuidv4(),
      jsonWebToken.verify_token(req.body.token)['id'],
      req.body.category,
      req.body.subject,
      req.body.content
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create tikcet" });
  }
};

exports.reportPost = async (req, res) => {
  try {
    const sql_query = `
      INSERT INTO
        Posts
      VALUES
      (
        ?
      )
    `;
    const data = [uuidv4()];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create post" });
  }
};

exports.reportEvent = async (req, res) => {
  try {
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "" });
  }
};