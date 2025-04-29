const pool = require("../config/database");

exports.get_comments = async (req, res) => {
  const post_id = req.params.post_id;

  try {
    const [rows] = await pool.query("SELECT ID, Content, Post, User FROM Comments WHERE Post = ?", [post_id]);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get comments" });
  }
};

exports.create_comment = async (req, res) => {
  const sqlQuery = "INSERT INTO Comments (ID, Content, Post, User) VALUES (?, ?, ?, ?)";
  const data = [req.body.id, req.body.content, req.body.post, req.body.user];

  try {
    const [results] = await pool.query(sqlQuery, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create comment" });
  }
};

exports.get_comments_by_post = async (req, res) => {
  const post_id = req.params.post_id;

  try {
    const [rows] = await pool.query("SELECT ID, Content, Post, User FROM Comments WHERE Post = ?", [post_id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error_message: "No comments found for this post" });
    }

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get comments for this post" });
  }
};