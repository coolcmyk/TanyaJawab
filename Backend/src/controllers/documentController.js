const db = require('../config/databaseConfig');

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

    const query = `
      INSERT INTO documents (user_id, original_filename, file_url, upload_timestamp)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const values = [userId, original_filename, file_url];
    const { rows } = await db.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error uploading document:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};