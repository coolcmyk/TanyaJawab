const db = require('../config/databaseConfig');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const parsedPagesModel = require('../models/parsedPagesModel');
const qdrant = require('../utils/qdrant');

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await db.query(
      `SELECT id, user_id, original_filename, upload_timestamp
       FROM documents
       WHERE user_id = $1
       ORDER BY upload_timestamp DESC`,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching documents:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id; // Use authenticated user
    const { original_filename } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!original_filename || !file_url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for existing document by filename and user
    const existingDocRes = await db.query(
      'SELECT * FROM documents WHERE user_id = $1 AND original_filename = $2 LIMIT 1',
      [userId, original_filename]
    );
    if (existingDocRes.rows.length > 0) {
      const existingDoc = existingDocRes.rows[0];
      const alreadyParsed = await parsedPagesModel.getParsedPagesByDocumentId(existingDoc.id);
      if (alreadyParsed) {
        return res.status(200).json({ ...existingDoc, message: 'Document already parsed.' });
      }
    }

    const query = `
      INSERT INTO documents (user_id, original_filename, file_url, upload_timestamp)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const values = [userId, original_filename, file_url];
    const { rows } = await db.query(query, values);
    const document = rows[0];

    // Check if already parsed
    const alreadyParsed = await parsedPagesModel.getParsedPagesByDocumentId(document.id);
    if (alreadyParsed) {
      return res.status(200).json({ ...document, message: 'Document already parsed.' });
    }

    // Parse PDF and store pages
    const filePath = `./uploads/${req.file.filename}`;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const pages = pdfData.text.split('\f');
    const parsedPages = [];
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i].trim();
      if (pageText) {
        // Convert to markdown (simple: wrap in code block)
        const markdown = '````\n' + pageText + '\n````';
        await parsedPagesModel.insertParsedPage({
          document_id: document.id,
          page_number: i + 1,
          extracted_text: markdown,
        });
        parsedPages.push({ page_number: i + 1, extracted_text: markdown });
      }
    }

    // Push to Qdrant
    await qdrant.pushPagesToQdrant(document.id, parsedPages);

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const docCheck = await db.query(
      `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (docCheck.rows.length === 0) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }
    await db.query(`DELETE FROM documents WHERE id = $1`, [id]);
    res.status(200).json({ message: "Dokumen berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting document:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};