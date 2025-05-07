const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', auth, (req, res) => res.status(200).json({ message: 'Logged out successfully' }));
router.get('/me', auth, authController.getMe);

module.exports = router;