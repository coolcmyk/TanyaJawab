const express = require('express');
const multer = require('multer');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' }); // Tentukan folder penyimpanan sementara

// Endpoint untuk mendapatkan semua dokumen (authenticated)
router.get('/', auth, documentController.getDocuments);

// Endpoint untuk menambahkan dokumen baru
router.post('/upload', auth, upload.single('file_url'), documentController.uploadDocument);

module.exports = router;