const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/auth');

// Route untuk mendapatkan semua tugas
router.get('/', auth, assignmentController.getAssignments);

// Route untuk menambahkan tugas baru
router.post('/', auth, assignmentController.addAssignment);

// Route untuk memperbarui tugas
router.put('/:id', auth, assignmentController.updateAssignment);

// Route untuk menghapus tugas
router.delete('/:id', auth, assignmentController.deleteAssignment);

// Route untuk memperbarui status tugas
router.patch('/:id/status', auth, assignmentController.updateAssignmentStatus);

module.exports = router;