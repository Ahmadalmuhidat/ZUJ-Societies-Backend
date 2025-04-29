const pool = require("../config/database");

exports.get_posts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT ID, Content, Likes, Comments, User FROM Posts");
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get posts" });
  }
};

exports.create_post = async (req, res) => {
  try {
    const sqlQuery = "INSERT INTO Posts (ID, Content, Likes, Comments, User) VALUES (?, ?, ?, ?, ?)";
    const data = [req.body.id, req.body.content, req.body.likes, req.body.comments, req.body.user];

    const [results] = await pool.query(sqlQuery, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create post" });
  }
};

exports.get_posts_by_society = async (req, res) => {
  try {
    const societyId = req.params.society_id;

    const sqlQuery = "SELECT ID, Content, Likes, Comments, User FROM Posts WHERE Society = ?";
    const data = [societyId];
    const [rows] = await pool.query(sqlQuery, data);
    
    if (rows.length === 0) {
      return res.status(404).json({ error_message: "No posts found for this society" });
    }

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get posts for this society" });
  }
};