const axios = require('axios');

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'doc_chunks';

exports.pushPagesToQdrant = async (documentId, pages) => {
  // pages: [{ page_number, extracted_text }]
  const points = pages.map((page) => ({
    id: `${documentId}-${page.page_number}`,
    payload: {
      document_id: documentId,
      page_number: page.page_number,
      text: page.extracted_text,
    },
    vector: page.vector || [], // If you have embedding, otherwise leave empty
  }));

  await axios.put(`${QDRANT_URL}/collections/${QDRANT_COLLECTION}/points`, {
    points,
  });
};
    