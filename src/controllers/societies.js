const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const mailer = require("../services/mailer")

exports.get_societies = async (req, res) => {
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
      req.body.user
    ];

    const [results] = await pool.query(sql_query, data);

    if (results) {
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
        "pending",
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
      req.body.society
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
    const data = [req.params.user, req.params.user];
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
    const data = [req.params.name];
    const [rows] = await pool.query(sql_query, data);

    res.status(200).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get society" });
  }
};

exports.join_society = async (req, res) => {
  try {
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
      "pending",
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

// get all members
exports.get_members = async (req, res) => {
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

exports.invite_member = async (req, res) => {
  try {
    const sql_query = `
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
      req.body.society_id,
      req.body.user_id,
      req.body.role
    ];

    mailer.send_email(req.body.email, "you have been added to society", "welcome");

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