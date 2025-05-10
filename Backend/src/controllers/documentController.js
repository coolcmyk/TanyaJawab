const db = require('../config/databaseConfig');

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching documents for user ID:", userId); // Debugging
    const { rows } = await db.query('SELECT * FROM documents WHERE user_id = $1', [userId]);
    console.log("Dokumen ditemukan:", rows); // Debugging
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching documents:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.uploadDocument = async (req, res) => {
  try {
    const { user_id, original_filename } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null; // Path file yang diunggah

    // Debugging: Log data yang diterima
    console.log('Data diterima:', { user_id, original_filename, file_url });
    console.log('File disimpan di:', req.file ? req.file.path : 'Tidak ada file'); // Debugging lokasi file

    if (!user_id || !original_filename || !file_url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const query = `
      INSERT INTO documents (user_id, original_filename, file_url, upload_timestamp)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const values = [user_id, original_filename, file_url];
    const { rows } = await db.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error uploading document:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};