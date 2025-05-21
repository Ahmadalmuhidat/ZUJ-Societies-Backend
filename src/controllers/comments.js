const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");

exports.get_comments = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Content,
        Post,
        User
      FROM
        Comments
      WHERE
        Post = ?
    `;
    const data = [req.params.post_id];

    const [rows] = await pool.query(sql_query, data);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get comments" });
  }
};

exports.create_comment = async (req, res) => {
  try {
    const sql_query = `
      INSERT INTO
        Comments
      VALUES
      (
        ?,
        ?,
        ?,
        ?
      )
    `;
    const data = [
      uuidv4(),
      req.body.content,
      req.body.post,
      req.body.user
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create comment" });
  }
};

exports.delete_comment = async (req, res) => {
  try {
    const sql_query = `
      DELETE FROM
        Comments
      WHERE
        ID = ?
    `;
    const data = [
      req.body.comment
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete comment" });
  }
};

exports.get_comments_by_post = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Content,
        Post,
        User
      FROM
        Comments
      WHERE
        Post = ?
    `;
    const data = [req.params.post_id];
    const [rows] = await pool.query(sql_query, data);

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get comments for this post" });
  }
};