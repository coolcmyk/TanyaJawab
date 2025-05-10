const express = require('express');
const multer = require('multer');
const router = express.Router();
const documentController = require('../controllers/documentController');

const upload = multer({ dest: 'uploads/' }); // Tentukan folder penyimpanan sementara

// Endpoint untuk mendapatkan semua dokumen
router.get('/', documentController.getDocuments);

// Endpoint untuk menambahkan dokumen baru
router.post('/upload', upload.single('file_url'), documentController.uploadDocument);

module.exports = router;