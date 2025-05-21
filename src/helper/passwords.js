const bcrypt = require('bcrypt');

async function hash_password(password) {
  try {
    const saltRounds = 10;
    const hashed_password = await bcrypt.hash(password, saltRounds);
    return hashed_password;
  } catch (err) {
    return res.status(500).json({ error: 'Failed to hash password' });
  }
}

async function verify_password(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify the password' });
  }
}

module.exports = {
  hash_password,
  verify_password,
};