const jsonWebToken = require('../helper/json_web_token');

function checkUserLoggedIn(req, res, next) {
  // Try to get the token from headers, body, or query
  const token =
    req.headers['authorization']?.split(' ')[1] || // Bearer <token>
    req.body?.token ||
    req.query?.token;

  if (!token) {
    return res.status(401).json({ error_message: "Token not provided" });
  }

  // Verify the token
  const valid = jsonWebToken.verify_token(token);

  if (valid) {
    next();
  } else {
    res.status(401).json({ error_message: "Failed to verify the token" });
  }
}

module.exports = {
  checkUserLoggedIn
};
