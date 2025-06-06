const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const mailer = require("../services/mailer")
const json_web_token = require("../helper/json_web_token")

exports.get_society_info = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        Name,
        Description,
        Image,
        Category
      FROM
        Societies
      WHERE
       ID = ?
    `;
    const [rows] = await pool.query(sql_query, [req.query.society_id]);
    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get society info" });
  }
};

exports.get_all_societies = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Name,
        Description,
        User,
        Image,
        Category
      FROM
        Societies
    `;
    const [rows] = await pool.query(sql_query);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get societies" });
  }
};

exports.create_society = async (req, res) => {
  try {
    const sql_query = `
      INSERT INTO
        Societies
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
    const new_society_id = uuidv4();
    const data = [
      new_society_id,
      req.body.name,
      req.body.description,
      json_web_token.verify_token(req.body.token)['id'],
      req.body.category,
      req.body.visibilty,
      req.body.image
    ];

    // add user to societies membership

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: new_society_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create society" });
  }
};

exports.delete_society = async (req, res) => {
  try {
    const sql_query = `
      DELETE FROM
        Societies
      WHERE
        ID = ?
    `;
    const data = [
      req.query.society_id
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to delete comment" });
  }
};

exports.get_societies_by_user = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        Societies.ID,
        Societies.Name,
        Societies.Description,
        Societies.User
      FROM
        Societies
      LEFT JOIN
        societies_memebers
      ON
        Societies.ID = societies_memebers.SocietyID
      WHERE
        Societies.User = ?
        OR societies_memebers.User = ?;
    `;
    const data = [req.query.user_id, req.query.user_id]; /// fix: get user id from the token
    const [rows] = await pool.query(sql_query, data);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get societies for the user" });
  }
};

exports.search_society = async (req, res) => {
  try {
    const sql_query = `
    SELECT
      ID,
      Name,
      Description,
      User
    FROM
      Societies
    WHERE
      ID = ?
    `;
    const data = [req.query.search_term];
    const [rows] = await pool.query(sql_query, data);

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get society" });
  }
};

exports.join_society_request = async (req, res) => {
  try {
    const request_status = "pending";
    const sql_query = `
    INSERT INTO
      societies_join_request
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
      req.body.society_id,
      json_web_token.verify_token(req.body.token)['id'],
      request_status,
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.approve_request = async (req, res) => {
  try {
    let sql_query = `
    SELECT
      User,
      Society
    FROM
      societies_join_request
    WHERE
      ID = ?
    `;
    const data = [
      req.body.request_id,
    ];

    const [results] = await pool.query(sql_query, data);

    if (results.length > 0) {
      sql_query = `
        UPDATE
          societies_join_request
        SET
          Status = 'approved'
        WHERE
          ID = ?
      `;
      await pool.query(sql_query, [
        req.body.request_id,
      ]);

      const member_role = "member";
      sql_query = `
      INSERT INTO
        societies_memebers
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
        results[0].Society,
        results[0].User,
        member_role
      ];

      // send email to the user that he has been accepted
      res.status(201).json({ data: await pool.query(sql_query, data) });
    } else {
      res.status(404).json({ error: "request was not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.reject_request = async (req, res) => {
  try {
    const sql_query = `
    UPDATE
      societies_join_request
    SET
      Status = 'rejected'
    WHERE
      ID = ?
    `;
    const data = [
      req.body.request_id,
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.get_all_join_requests = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        societies_join_request.ID AS Request_ID,
        societies_join_request.Status,
        users.ID AS User_ID,
        users.Name AS User_Name,
        users.Email AS User_Email,
        users.Photo AS User_Photo,
        societies_join_request.Status
      FROM
        societies_join_request
      JOIN
        users
      ON
        societies_join_request.User = users.ID
      WHERE
        societies_join_request.Society = ?
    `;
    const data = [
      req.query.society_id,
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.get_all_members = async (req, res) => {
  try {
    const sql_query = `
    SELECT
      Users.ID,
      Users.Name,
      Users.Email,
      Users.Photo,
      societies_memebers.Role
    FROM
      Users
    JOIN
      societies_memebers
    ON
      societies_memebers.User = Users.ID
    WHERE
      societies_memebers.Society = ?
    `;
    const data = [
      req.query.society_id,
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.remove_member = async (req, res) => {
  try {
    const sql_query = `
      DELETE FROM
        societies_memebers
      WHERE
        User=?
      AND
        Society=?
    `;
    const data = [
      req.query.society_id,
      req.query.user_id
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.check_membership = async (req, res) => {
  try {
    const sql_query = `
    SELECT EXISTS (
      SELECT
        1
      FROM
        societies_memebers
      WHERE
        User = ?
      AND
        Society = ?
    ) AS is_member;
    `;
    const data = [
      json_web_token.verify_token(req.query.token)['id'],
      req.query.society_id
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results[0].is_member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to check membership" });
  }
};