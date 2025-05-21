const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");

exports.get_all_posts = async (req, res) => { // fix, get from socities that he is in
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
    const initial_comments = 0;
    const initial_likes = 0;
    const data = [
      uuidv4(),
      req.body.content,
      initial_likes,
      initial_comments,
      req.body.user_id // fix: get from token
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create post" });
  }
};

exports.delete_post = async (req, res) => {
  try {
    const sql_query = `
      DELETE FROM
        Posts
      WHERE
        ID = ?
    `;
    const data = [
      req.params.post_id
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete post" });
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

// add likes routes