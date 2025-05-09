const db = require('../config/databaseConfig');

exports.getRecentDocuments = async (userId, limit = 3) => {
  const res = await db.query(
    `SELECT * FROM documents WHERE user_id = $1 ORDER BY upload_timestamp DESC LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
};