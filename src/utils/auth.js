const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateAuthToken = (userId, role) => {
  // Generate JWT token with userId and role (or other claims as necessary)
  return jwt.sign({ userId, role }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
};

const hashPassword = (password) => {
  // Hash the password using bcrypt
  return bcrypt.hash(password, 10);
};

const comparePassword = (password, hashedPassword) => {
  // Compare password with hashed password
  return bcrypt.compare(password, hashedPassword);
};

module.exports = { generateAuthToken, hashPassword, comparePassword };
