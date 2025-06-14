const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const jsonWebToken = require("../helper/json_web_token")

exports.getAllPosts = async (req, res) => {
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
        Users.Photo AS User_Image,
        CASE WHEN Likes.ID IS NOT NULL THEN 1 ELSE 0 END AS Is_Liked
      FROM
        Posts
      JOIN
        Societies
      ON
        Posts.Society = Societies.ID
      JOIN
        Users
      ON
        Posts.User = Users.ID
      JOIN
        Societies_Members
      ON
        Societies_Members.Society = Societies.ID
      LEFT JOIN
        Likes
      ON
        Likes.Post = Posts.ID
      AND
        Likes.User = Societies_Members.User
      WHERE
        Societies_Members.User = ?
    `;
    const [rows] = await pool.query(sql_query, [jsonWebToken.verify_token(req.query.token)['id']]);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Posts" });
  }
};

exports.createPost = async (req, res) => {
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
        ?,
        ?,
        ?
      )
    `;
    const initial_Comments = 0;
    const initial_likes = 0;
    const data = [
      uuidv4(),
      req.body.content,
      initial_likes,
      initial_Comments,
      jsonWebToken.verify_token(req.body.token)['id'],
      req.body.image,
      req.body.society_id,
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create post" });
  }
};

exports.deletePost = async (req, res) => {
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

exports.getPostsBySociety = async (req, res) => {
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
        Users.Photo AS User_Image,
        CASE WHEN Likes.ID IS NOT NULL THEN 1 ELSE 0 END AS Is_Liked
      FROM
        Posts
      JOIN
        Users
      ON
        Posts.User = Users.ID
      LEFT JOIN
        Likes
      ON
        Likes.Post = Posts.ID
      WHERE
        Posts.Society = ?
    `;
    const data = [req.query.society_id];
    const [rows] = await pool.query(sql_query, data);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Posts for this society" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const UserId = jsonWebToken.verify_token(req.body.token)['id'];
    const postId = req.body.post_id;

    const checkQuery = `
      SELECT 1 FROM Likes
      WHERE User = ? AND Post = ?
      LIMIT 1
    `;
    const [existing] = await pool.query(checkQuery, [UserId, postId]);

    if (existing.length > 0) {
      return res.status(400).json({ error_message: "User already liked this post" });
    }

    const insertQuery = `
      INSERT INTO Likes (ID, User, Post)
      VALUES (?, ?, ?)
    `;
    await pool.query(insertQuery, [uuidv4(), UserId, postId]);

    const increaseQuery = `
      UPDATE Posts
      SET Likes = Likes + 1
      WHERE ID = ?
    `;
    await pool.query(increaseQuery, [postId]);

    res.status(200).json({ data: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to like post" });
  }
};
