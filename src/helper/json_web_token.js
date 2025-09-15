const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables.");
}

// Generate a signed JWT token
function generate_token(user) {
  if (!user?.id || !user?.email) {
    throw new Error("Invalid user object provided.");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function verify_token(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.warn("Invalid or expired token:", err.message);
    return null;
  }
}

module.exports = {
  generate_token,
  verify_token,
};
