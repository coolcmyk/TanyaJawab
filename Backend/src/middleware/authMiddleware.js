const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error("Token tidak ditemukan atau format salah");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user ke request
    console.log("Token valid, user ID:", decoded.id); // Debugging
    next();
  } catch (error) {
    console.error("Token tidak valid:", error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};