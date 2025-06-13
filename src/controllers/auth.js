const pool = require("../config/database");
const mailer = require("../services/mailer");
const passwords_helper = require("../helper/passwords")
const jsonWebToken = require("../helper/json_web_token")
const { v4: uuidv4 } = require("uuid");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.query;

    const sqlQuery = `
      SELECT
        ID,
        Password,
        Name,
        Email
      FROM
        Users
      WHERE
        Email = ?
    `;

    const [results] = await pool.execute(sqlQuery, [email]);

    if (results.length > 0) {
      const User = results[0];
      const isPasswordCorrect = await passwords_helper.verify_password(password, User.Password);

      if (isPasswordCorrect) {
        const token = jsonWebToken.generate_token({
          id: User.ID,
          name: User.Name,
          email: User.Email
        });
        return res.status(201).json({ data: token });
      } else {
        return res.status(401).json({ error: "Password is incorrect" });
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
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
        ?,
        ?,
        ?,
        ?
      )
    `;
    const create_date =  new Date().toISOString().slice(0, 10);;
    const data = [
      uuidv4(),
      req.body.name,
      req.body.email,
      await passwords_helper.hash_password(req.body.password),
      req.body.student_id,
      req.body.photo,
      req.body.bio,
      req.body.phone_number,
      create_date
    ];

    const [results] = await pool.query(sql_query, data);
    res.status(201).json({ data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to create User" });
  }
};