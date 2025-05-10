const db = require('../config/databaseConfig');

exports.insertParsedPage = async ({ document_id, page_number, extracted_text, image_path = null }) => {
  const query = `
    INSERT INTO parsed_pages (document_id, page_number, extracted_text, image_path)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [document_id, page_number, extracted_text, image_path];
  const { rows } = await db.query(query, values);
  return rows[0];
};

exports.getParsedPagesByDocumentId = async (document_id) => {
  const query = `SELECT 1 FROM parsed_pages WHERE document_id = $1 LIMIT 1;`;
  const { rows } = await db.query(query, [document_id]);
  return rows.length > 0;
};
