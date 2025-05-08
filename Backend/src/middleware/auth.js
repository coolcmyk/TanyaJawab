const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is valid, but user not found' });
    }
    
    // Add user to request
    req.user = { id: user.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};