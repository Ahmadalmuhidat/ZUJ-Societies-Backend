const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const jsonWebToken = require("../helper/json_web_token")

exports.createComment = async (req, res) => {
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
      req.body.post_id,
      jsonWebToken.verify_token(req.body.User_id)['id']
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create comment" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const sql_query = `
      DELETE FROM
        Comments
      WHERE
        ID = ?
    `;
    const data = [
      req.query.comment_id
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete comment" });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        Comments.ID,
        Comments.Content,
        Users.Name AS User_Name,
        Users.Photo AS User_Photo
      FROM
        Comments
      JOIN
        Users
      ON
        Comments.User = Users.ID
      WHERE
        Comments.Post = ?
    `;
    const data = [req.query.post_id];
    const [rows] = await pool.query(sql_query, data);

    res.status(201).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Comments for this post" });
  }
};