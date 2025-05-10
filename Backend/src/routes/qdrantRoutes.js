// Backend/src/routes/qdrantRoutes.js
const express = require('express');
const router = express.Router();
const qdrantController = require('../controllers/qdrantController');

router.post('/upsert-chunks', qdrantController.upsertChunks);
router.post('/query', qdrantController.queryRAG);

module.exports = router;