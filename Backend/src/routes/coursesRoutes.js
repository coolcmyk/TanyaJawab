const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController'); 
const auth = require('../middleware/authMiddleware');

console.log('auth:', auth); // Debugging
console.log('courseController.addCourse:', courseController.addCourse); // Debugging

// Route untuk menambahkan course
router.post('/', auth, courseController.addCourse);

// Route untuk mendapatkan semua course
router.get('/', auth, courseController.getCourses);

// Route untuk mendapatkan course berdasarkan ID    
router.put('/:id', auth, courseController.updateCourse);

module.exports = router;