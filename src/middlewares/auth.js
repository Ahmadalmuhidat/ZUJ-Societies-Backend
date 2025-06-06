const json_web_token = require('../helper/json_web_token');

function check_user_logged_in(req, res, next) {
  // Try to get the token from headers, body, or query
  const token =
    req.headers['authorization']?.split(' ')[1] || // Bearer <token>
    req.body?.token ||
    req.query?.token;

  if (!token) {
    return res.status(401).json({ error_message: "Token not provided" });
  }

  // Verify the token
  const valid = json_web_token.verify_token(token);

  if (valid) {
    // Optionally: attach decoded user to request for later use
    req.user = valid;
    next();
  } else {
    res.status(401).json({ error_message: "Failed to verify the token" });
  }
}

module.exports = {
  check_user_logged_in
};
