const jwt = require('jsonwebtoken');

const generate_token = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const verify_token = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generate_token,
  verify_token,
};
