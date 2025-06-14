const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const mailer = require("../services/mailer")
const jsonWebToken = require("../helper/json_web_token")

exports.getSocietyInformation = async (req, res) => {
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

exports.getAllSocieties = async (req, res) => {
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

exports.createSociety = async (req, res) => {
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
    const user_id = jsonWebToken.verify_token(req.body.token)['id'];
    const data = [
      new_society_id,
      req.body.name,
      req.body.description,
      user_id,
      req.body.category,
      req.body.visibilty,
      req.body.image
    ];
    await pool.query(sql_query, data);

    const member_query = `
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
    const member_data = [uuidv4(), new_society_id, user_id, "admin"];
    await pool.query(member_query, member_data);

    res.status(201).json({ data: new_society_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create society" });
  }
};

exports.deleteSociety = async (req, res) => {
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

exports.getSocietiesByUser = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        Societies.ID,
        Societies.Image,
        Societies.Name,
        Societies.Category,
        Societies.Description,
        societies_memebers.Role
      FROM
        Societies
      LEFT JOIN
        societies_memebers
      ON
        Societies.ID = societies_memebers.Society
      WHERE
        Societies.User = ?
      OR
        societies_memebers.User = ?
    `;
    const UserID = jsonWebToken.verify_token(req.query.token)['id'];    
    const data = [UserID, UserID];
    const [rows] = await pool.query(sql_query, data);
    res.status(201).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get societies for the user" });
  }
};

exports.searchSociety = async (req, res) => {
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
      Name = ?
    `;
    const data = [req.query.search_term];
    const [rows] = await pool.query(sql_query, data);

    res.status(201).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get society" });
  }
};

exports.joinSocietyRequest = async (req, res) => {
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
      jsonWebToken.verify_token(req.body.token)['id'],
      request_status,
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to join society" });
  }
};

exports.approveRequest = async (req, res) => {
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

exports.rejectRequest = async (req, res) => {
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

exports.getAllJoinRequests = async (req, res) => {
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

exports.getAllMembers = async (req, res) => {
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

exports.removeMember = async (req, res) => {
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

exports.checkMembership = async (req, res) => {
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
    ) AS is_member
    `;
    const data = [
      jsonWebToken.verify_token(req.query.token)['id'],
      req.query.society_id
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results[0].is_member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to check membership" });
  }
};

exports.updateInformation = async (req, res) => {
  try {
    const sql_query = `
    UPDATE
      Societies
    SET
      Name = ?,
      Description = ?,
      Category = ?
    WHERE
      ID = ?
    `;
    const data = [
      req.body.name,
      req.body.description,
      req.body.category,
      req.body.society_id
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to update society info" });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const sql_query = `
    UPDATE
      societies_memebers
    SET
      Role = ?
    WHERE
      User = ?
    AND
     Society = ?
    `;
    const data = [
      req.body.role,
      req.body.member,
      req.body.society_id
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to update society info" });
  }
};

exports.leaveSociety = async (req, res) => {
  try {
    const sql_query = `
    DELETE FROM
      societies_memebers
    WHERE
      User = ?
    AND
     Society = ?
    `;
    const data = [
      jsonWebToken.verify_token(req.body.token)['id'],
      req.body.society_id
    ];
    const [results] = await pool.query(sql_query, data);
    res.status(200).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to leave society" });
  }
};