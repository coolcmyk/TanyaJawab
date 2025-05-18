const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getEmbeddings(texts) {
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent',
    { contents: texts.map(text => ({ parts: [{ text }] })) },
    { params: { key: GEMINI_API_KEY } }
  );
  return response.data.embeddings.map(e => e.values);
}

async function generateAnswer(context, question) {
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    {
      contents: [
        { parts: [{ text: `Context: ${context}\n\nQuestion: ${question}` }] }
      ]
    },
    { params: { key: GEMINI_API_KEY } }
  );
  return response.data.candidates[0].content.parts[0].text;
}

module.exports = { getEmbeddings, generateAnswer };