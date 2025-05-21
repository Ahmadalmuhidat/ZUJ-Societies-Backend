const pool = require("../config/database");

exports.get_users = async (req, res) => {
  try {
    const sql_query = `
      SELECT
        ID,
        Name
      FROM
        Users
    `
    const [rows] = await pool.query(sql_query);
    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error_message: "Failed to get users" });
  }
};
