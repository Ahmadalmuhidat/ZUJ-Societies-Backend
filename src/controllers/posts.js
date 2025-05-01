const pool = require("../config/database");

exports.get_posts = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Content,
        Likes,
        Comments,
        User
      FROM
        Posts
    `;
    const [rows] = await pool.query(sql_query);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get posts" });
  }
};

exports.create_post = async (req, res) => {
  try {
    const sql_query = `
      INSERT INTO
        Posts
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
      req.body.id,
      req.body.content,
      req.body.likes,
      req.body.comments,
      req.body.user
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create post" });
  }
};

exports.get_posts_by_society = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Content,
        Likes,
        Comments,
        User
      FROM
        Posts
      WHERE
        Society = ?
    `;
    const data = [req.params.society_id];
    const [rows] = await pool.query(sql_query, data);

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get posts for this society" });
  }
};