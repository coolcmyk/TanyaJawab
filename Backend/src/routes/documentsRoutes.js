const express = require('express');
const multer = require('multer');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' }); // Tentukan folder penyimpanan sementara

// Endpoint untuk mendapatkan semua dokumen (authenticated)
router.get('/', authMiddleware, documentController.getDocuments);

// Endpoint untuk menambahkan dokumen baru
router.post('/upload', authMiddleware, upload.single('file_url'), documentController.uploadDocument);

router.delete('/:id', authMiddleware, documentController.deleteDocument);

module.exports = router;