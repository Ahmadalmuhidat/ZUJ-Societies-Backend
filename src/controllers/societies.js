const pool = require("../config/database");

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
      req.body.id,
      req.body.name,
      req.body.description,
      req.body.user
    ];

    // insert as member

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create society" });
  }
};

exports.get_societies_by_user = async (req, res) => {
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
        User = ?
    `;
    const data = [req.params.user_id];
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
    const data = ["id", req.body.society_id, req.body.user_id, "pending",];

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
      "id",
      req.body.society_id,
      req.body.user_id,
      req.body.role
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