const qdrant = require('../config/qdrantConfig');
const { getEmbeddings, generateAnswer } = require('../utils/geminiApi');

const COLLECTION_NAME = 'doc_chunks';

exports.upsertChunks = async (req, res) => {
  const { chunks, documentId } = req.body; // chunks: [{text, page_number}]
  const embeddings = await getEmbeddings(chunks.map(c => c.text));
  const points = chunks.map((chunk, i) => ({
    id: `${documentId}-${chunk.page_number}`,
    vector: embeddings[i],
    payload: {
      document_id: documentId,
      page_number: chunk.page_number,
      text: chunk.text,
    },
  }));
  await qdrant.upsert(COLLECTION_NAME, { wait: true, points });
  res.json({ success: true });
};

exports.queryRAG = async (req, res) => {
  
  const { question, documentId, topK = 3 } = req.body;
  const [embedding] = await getEmbeddings([question]);
  const results = await qdrant.search(COLLECTION_NAME, {
    vector: embedding,
    limit: topK,
    filter: {
      must: [{ key: 'document_id', match: { value: documentId } }],
    },
  });
  const context = results.map(r => r.payload.text).join('\n');
  const answer = await generateAnswer(context, question);
  res.json({ answer, context, sources: results });
};