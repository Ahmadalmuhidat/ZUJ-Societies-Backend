const jwt_token_helper = require('../helper/jwt_token');

const BasicMiddleware = (req, res, next) => {
  const token = req.params.society_Id;
  if (jwt_token_helper.verify_token(token)) {
    next();
  }
  else {
    res.status(401).json({ error_message: "failed to verify the token" });
  }
};

module.exports = BasicMiddleware;
