const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const json_web_token = require("../helper/json_web_token")

exports.get_all_posts = async (req, res) => { // fix, get from socities that he is in
  try {
    const sql_query = `
      SELECT
        Posts.ID,
        Posts.Content,
        Posts.Likes,
        Posts.Image,
        Posts.Comments,
        Societies.Name AS Society_Name,
        Posts.User,
        Users.Name AS User_Name,
        Users.Photo AS User_Image
      FROM Posts
      JOIN Societies ON Posts.Society = Societies.ID
      JOIN Users ON Posts.User = Users.ID
      JOIN Societies_Memebers ON Societies_Memebers.Society = Societies.ID AND Societies_Memebers.User = Users.ID
      WHERE Societies_Memebers.User = ?
    `;
    const [rows] = await pool.query(sql_query, [json_web_token.verify_token(req.query.token)['id']]);
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
      json_web_token.verify_token(req.body.token)['id'],
      req.body.image
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
      req.query.post_id
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
        Posts.ID,
        Posts.Content,
        Posts.Likes,
        Posts.Image,
        Posts.Comments,
        Posts.User,
        Users.Name AS User_Name,
        Users.Photo AS User_Image
      FROM
        Posts
      JOIN
        Users
      ON
        Posts.User = Users.ID
      WHERE
        Posts.Society = ?
    `;
    const data = [req.query.society_id];
    const [rows] = await pool.query(sql_query, data);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get posts for this society" });
  }
};

// add likes routes