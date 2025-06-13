const jwt = require('jsonwebtoken');

function generate_token(User) {
  return jwt.sign(
    {
      id: User.id,
      email: User.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

function verify_token(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generate_token,
  verify_token,
};
