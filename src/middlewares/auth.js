const json_web_token = require('../helper/json_web_token');

const check_user_logged_in = (req, res, next) => {
  const token = req.params.society_Id;
  if (json_web_token.verify_token(token)) {
    next();
  }
  else {
    res.status(401).json({ error_message: "failed to verify the token" });
  }
};

module.exports = check_user_logged_in;
