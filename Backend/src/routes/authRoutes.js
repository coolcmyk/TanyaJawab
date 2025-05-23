const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Regular auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', auth, (req, res) => res.status(200).json({ message: 'Logged out successfully' }));
router.get('/me', auth, authController.getMe);

// GitHub OAuth routes
router.get('/github', authController.githubAuth);
router.get('/github/callback', authController.githubCallback);

module.exports = router;