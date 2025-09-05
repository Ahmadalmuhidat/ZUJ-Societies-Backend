const jsonWebToken = require('../helper/json_web_token');

function checkUserLoggedIn(req, res, next) {
  const token =
    req.headers['authorization']?.split(' ')[1] ||
    req.body?.token ||
    req.query?.token;

  if (!token) return res.status(401).json({ error_message: "Token not provided" });

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
