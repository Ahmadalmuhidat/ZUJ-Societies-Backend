const mailer = require("../services/mailer");
const passwords_helper = require("../helper/passwords")
const json_web_token = require("../helper/json_web_token")
const { v4: uuidv4 } = require("uuid");

exports.login = async (req, res) => {
  try {
    const sqlQuery = `
      SELECT
        ID,
        Password,
        Role
      FROM
        users
      WHERE
        Email = ?
    `;

    await pool.query(sqlQuery, [req.params.email], (err, results) => {
      if (err) res.status(200).json({ ErrorMessage: "Error While Logging The User" });
      if (results.length > 0) {
        const user = results[0];
        const verify_password = passwords_helper.verify_password(req.params.password, user.Password);
        if (verify_password) {
          const token = json_web_token.generate_token({
            "id": user.ID,
            "role": user.Role
          });
          res.status(200).json({ data: token });
        }
        else {
          res.status(401).json({ error: "password is incorrect" });
        }
      }
      else {
        res.status(404).json({ error: "user has not been found" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const sql_query = `
      INSERT INTO
        Users
      VALUES
      (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `;
    const data = [
      uuidv4(),
      req.body.name,
      req.body.email,
      passwords_helper.hash_password(req.body.password),
      req.body.student_id,
      req.body.photo
    ];

    mailer.send_email(req.body.email, "welcone to zuj societies", "welcome");
    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create user" });
  }
};