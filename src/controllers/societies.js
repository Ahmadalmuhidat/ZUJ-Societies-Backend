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
    res.status(500).json({ error_message: "Failed to get Societies" });
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
    const User_id = jsonWebToken.verify_token(req.body.token)['id'];
    const data = [
      new_society_id,
      req.body.name,
      req.body.description,
      User_id,
      req.body.category,
      req.body.visibilty,
      req.body.image
    ];
    await pool.query(sql_query, data);

    const member_query = `
      INSERT INTO
        Societies_Members
      VALUES
      (
        ?,
        ?,
        ?,
        ?
      )
    `;
    const member_data = [uuidv4(), new_society_id, User_id, "admin"];
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
        Societies_Members.Role
      FROM
        Societies
      LEFT JOIN
        Societies_Members
      ON
        Societies.ID = Societies_Members.Society
      WHERE
        Societies.User = ?
      OR
        Societies_Members.User = ?
    `;
    const UserID = jsonWebToken.verify_token(req.query.token)['id'];    
    const data = [UserID, UserID];
    const [rows] = await pool.query(sql_query, data);
    res.status(201).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get Societies for the User" });
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
      Name LIKE ?
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
      Societies_Join_Requests
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
      Societies_Join_Requests
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
          Societies_Join_Requests
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
        Societies_Members
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

      // send email to the User that he has been accepted
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
      Societies_Join_Requests
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
        Societies_Join_Requests.ID AS Request_ID,
        Societies_Join_Requests.Status,
        Users.ID AS User_ID,
        Users.Name AS User_Name,
        Users.Email AS User_Email,
        Users.Photo AS User_Photo,
        Societies_Join_Requests.Status
      FROM
        Societies_Join_Requests
      JOIN
        Users
      ON
        Societies_Join_Requests.User = Users.ID
      WHERE
        Societies_Join_Requests.Society = ?
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
      Societies_Members.Role
    FROM
      Users
    JOIN
      Societies_Members
    ON
      Societies_Members.User = Users.ID
    WHERE
      Societies_Members.Society = ?
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
        Societies_Members
      WHERE
        User=?
      AND
        Society=?
    `;
    const data = [
      req.query.society_id,
      req.query.User_id
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
        Societies_Members
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
      Societies_Members
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
      Societies_Members
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