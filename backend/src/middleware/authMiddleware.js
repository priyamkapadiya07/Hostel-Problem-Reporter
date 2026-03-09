const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization');

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Extract token from Bearer string
    const tokenParts = token.split(' ');
    const tokenString = tokenParts.length === 2 && tokenParts[0] === 'Bearer' ? tokenParts[1] : token;

    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
