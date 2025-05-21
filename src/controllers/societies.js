const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const mailer = require("../services/mailer")

exports.get_all_societies = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Name,
        Description,
        User
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
        ?
      )
    `;
    const data = [
      uuidv4(),
      req.body.name,
      req.body.description,
      req.body.user_id // fix: get from token
    ];

    const [results] = await pool.query(sql_query, data);

    if (results) {
      const request_status = "pending";
      const sql_query = `
        INSERT INTO
          societies_join_requests
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
        req.body.society,
        req.body.user,
        request_status,
      ];
      const [results] = await pool.query(sql_query, data);
      res.status(201).json({ data: results });
    } else {
      res.status(500).json({ error_message: "Failed to create society" });
    }
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
      req.params.society_id
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
        societies_members
      ON
        Societies.ID = societies_members.SocietyID
      WHERE
        Societies.User = ?
        OR societies_members.User = ?;
    `;
    const data = [req.params.user_id, req.params.user_id]; /// fix: get user id from the token
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
    const data = [req.params.search_term];
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
      societies_join_requests
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
      req.body.user_id,
      request_status,
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.accept_request = async (req, res) => {
  try {
    const sql_query = `
    SELECT
      User,
      Society
    FROM
      societies_join_requests
    WHERE
      ID = ?
    `;
    const data = [
      req.body.request_id,
    ];

    const [results] = await pool.query(sql_query, data);

    if (results.length > 0) {
      const member_role = "member";
      sql_query = `
      INSERT INTO
        societies_members
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

      const [results] = await pool.query(sql_query, data);
      res.status(201).json({ data: results });
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
      societies_join_requests
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

exports.get_all_requests = async (req, res) => {
  try {
    const sql_query = `
    SELECT
      *
    FROM
      societies_join_requests
    WHERE
      Society = ?
    `;
    const data = [
      req.params.society_id,
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
      *
    FROM
      societies_members
    WHERE
      Society = ?
    `;
    const data = [
      req.params.society_id,
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
        societies_members
      WHERE
        User=?
      AND
        Society=?
    `;
    const data = [
      req.params.society_id,
      req.params.user_id
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};