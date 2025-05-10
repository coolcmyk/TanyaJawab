const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, dashboardController.getDashboard);

module.exports = router;