 
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
