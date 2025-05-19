const axios = require('axios');
const { execFile } = require('child_process');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ----------------------------------------
// Embedding helpers
// ----------------------------------------

async function getEmbeddings(texts) {
  try {
    if (!texts || texts.length === 0) {
      throw new Error('No texts provided for embeddings');
    }

    const validTexts = texts.map(item => {
      if (typeof item === 'string') {
        return item.slice(0, 8000);
      }
      if (item && typeof item.text === 'string') {
        return item.text.slice(0, 8000);
      }
      return String(item || '').slice(0, 8000);
    });

    console.log(`Generating embeddings for ${validTexts.length} texts`);

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent',
      {
        model: "models/gemini-embedding-exp-03-07",
        content: {
          parts: [{ text: validTexts[0] }]
        }
      },
      { params: { key: GEMINI_API_KEY } }
    );

    if (response.data && response.data.embedding) {
      return [response.data.embedding.values];
    } else {
      throw new E rror('Unexpected response format from embeddings API');
    }
  } catch (error) {
    console.error('Error getting embeddings:', error.message);
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function getBatchEmbeddings(texts) {
  const embeddings = [];
  for (let i = 0; i < texts.length; i += 10) {
    const batch = texts.slice(i, i + 10);
    console.log(`Processing batch ${Math.floor(i / 10) + 1} of ${Math.ceil(texts.length / 10)}`);

    const batchResults = await Promise.all(batch.map(async item => {
      try {
        const content = (typeof item === 'string' ? item : item.text).slice(0, 8000);
        const resp = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent',
          {
            model: "models/gemini-embedding-exp-03-07",
            content: { parts: [{ text: content }] }
          },
          { params: { key: GEMINI_API_KEY } }
        );
        return resp.data?.embedding?.values || null;
      } catch (err) {
        console.error(`Error embedding text: "${String(item).slice(0, 50)}..."`, err.message);
        return null;
      }
    }));

    embeddings.push(...batchResults);

    if (i + 10 < texts.length) {
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  return embeddings;
}

// ----------------------------------------
// Helper function to detect fallback keywords
// ----------------------------------------

function shouldFallbackToSearch(text) {
  if (!text) return true; // Always fallback if text is empty
  
  // Normalize the text for better matching
  const normalizedText = text.toLowerCase().trim();
  
  // Define trigger phrases (add more as needed)
  const triggerPhrases = [
    'not in context',
    'not_in_context', // Add the exact match without spaces
    'don\'t have',
    'i don\'t know',
    'no information',
    'insufficient context',
    'not provided',
    'cannot find',
    'doesn\'t mention',
    'tidak ada informasi',
    'tidak disebutkan',
    'tidak memiliki konteks',
    'tidak dapat menemukan',
    'i couldn\'t find',
    'i could not find',
    'i\'m sorry, i',
    'maaf, saya'
  ];
  
  // Check if any trigger phrase is in the response
  return triggerPhrases.some(phrase => normalizedText.includes(phrase));
}

// ----------------------------------------
// Direct Grounding Search Implementation
// ----------------------------------------

async function performGroundingSearch(query) {
  try {
    console.log('Starting grounding search for query:', query);
    
    // Use gemini-1.5-pro which has better search capabilities
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    console.log('Using API endpoint:', apiUrl);
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `
You are Aiko, a helpful AI assistant.

Question: ${query}

Please search for information and provide a helpful, accurate answer.
Format your answer using Markdown for better readability.
If you can't find relevant information, respond with "I'M_SORRY_I_DONT_KNOW".
`
            }
          ]
        }
      ],
      tools: [
        {
          googleSearch: {}  // Using googleSearch instead of googleSearchRetrieval
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    };
    
    console.log('Sending grounding search request...');
    
    const response = await axios.post(
      apiUrl,
      payload,
      { 
        params: { key: GEMINI_API_KEY },
        timeout: 40000  // Extended timeout for search operations
      }
    );
    
    console.log('Received grounding search response with status:', response.status);
    
    // Extract text from response
    let answer = '';
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content) {
          
      const parts = response.data.candidates[0].content.parts;
      console.log('Found grounding search response parts:', parts.length);
      
      for (const part of parts) {
        if (part.text) {
          answer += part.text;
        }
      }
    }
    
    // Handle empty or "I'm sorry" responses
    answer = answer.trim();
    if (!answer || answer === 'I\'M_SORRY_I_DONT_KNOW' || answer.includes('I\'M_SORRY_I_DONT_KNOW')) {
      answer = `Maaf, saya tidak dapat menemukan informasi tentang "${query}" melalui pencarian web.

Pertanyaan Anda mungkin terlalu spesifik atau informasi tersebut tidak tersedia secara publik. Silakan coba pertanyaan lain atau perjelas pertanyaan Anda.`;
    }
    
    console.log(`Grounding search result: "${answer.substring(0, 100)}..."`);
    return answer;
  } catch (error) {
    console.error('Error performing grounding search:', error.message);
    
    // Detailed error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received, request was:', error.request);
    } else {
      console.error('Error details:', error.stack);
    }
    
    throw error;
  }
}

// ----------------------------------------
// Main Q&A with fallback to groundingSearch
// ----------------------------------------

async function generateAnswer(context, question) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return "Konfigurasi API belum lengkap. Silakan hubungi administrator.";
    }

    const maxContextLength = 30000;
    const limitedContext = context.length > maxContextLength
      ? context.substring(0, maxContextLength) + '... (truncated)'
      : context;

    const basePrompt = `
You are Aiko, a friendly yet brilliant AI assistant.

Context from the document:
${limitedContext}

Question: ${question}

Instructions for Aiko:
1. Answer using ONLY the context above.
2. If you don't know, respond with EXACTLY "NOT_IN_CONTEXT".
3. Be concise and warm.
`;

    console.log('→ First attempt: asking Gemini with document context');
    const firstResp = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      { contents: [{ parts: [{ text: basePrompt }] }] },
      { params: { key: GEMINI_API_KEY }, timeout: 30000 }
    );

    // Store the response text in a variable we'll return at the end if needed
    const firstText = firstResp.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Enhanced logging to debug the response
    console.log(`Gemini response: "${firstText.substring(0, 100)}..."`);

    // Check if the response should trigger fallback - more comprehensive check
    if (
      firstText === 'NOT_IN_CONTEXT' || 
      firstText.toUpperCase() === 'NOT_IN_CONTEXT' ||
      shouldFallbackToSearch(firstText)
    ) {
      console.log(`↪️ Context insufficient (detected: "${firstText.substring(0, 50)}..."), calling grounding search...`);

      try {
        // Replace Python script with direct JS implementation
        const answer = await performGroundingSearch(question);
        console.log('→ Grounding search result:', answer.substring(0, 100) + '...');
        return answer;
      } catch (groundingError) {
        console.error('Failed to use grounding search:', groundingError.message);
        console.log('↪️ Falling back to simple web search');
        
        // Fall back to the existing web search method if grounding search fails
        const results = await webSearch(question);
        const snippets = results.map(r => r.snippet).join('\n\n') || 'No snippets found.';

        const searchPrompt = `
You are Aiko, a friendly yet brilliant AI assistant.

Web search snippets:
${snippets}

Question: ${question}

Instructions for Aiko:
1. Answer using ONLY the snippets above.
2. If still unknown, respond with EXACTLY "I'M_SORRY_I_DONT_KNOW".
3. Be concise and warm.
`;

        console.log('→ Second attempt: asking Gemini with web search context');
        const searchResp = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
          { contents: [{ parts: [{ text: searchPrompt }] }] },
          { params: { key: GEMINI_API_KEY }, timeout: 30000 }
        );

        let searchText = searchResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                         "Maaf, saya tidak dapat menemukan jawaban.";
                         
        // Improve "I'm sorry" responses
        if (searchText === "I'M_SORRY_I_DONT_KNOW" || searchText.includes("I'M_SORRY_I_DONT_KNOW")) {
          searchText = `Maaf, saya tidak dapat menemukan informasi tentang "${question}" baik dari dokumen maupun dari pencarian web.

Pertanyaan Anda mungkin terlalu spesifik atau informasi tersebut tidak tersedia. Silakan coba pertanyaan lain atau perjelas pertanyaan Anda.`;
        }
        
        return searchText;
      }
    }

    // Return the answer from Gemini if we didn't take another path
    return firstText;
  } catch (error) {
    console.error('❌ Error in generateAnswer:', error.message);
    if (error.response) {
      const { status } = error.response;
      if (status === 403) return "API key tidak valid. Silakan hubungi administrator.";
      if (status === 429) return "Batas penggunaan API tercapai. Silakan coba lagi nanti.";
    }
    return "Terjadi kesalahan saat menjawab. Silakan coba lagi.";
  }
}

// ----------------------------------------
// Web search helper (used internally)
// ----------------------------------------

async function webSearch(query) {
  try {
    console.log('Starting web search for query:', query);
    
    // Switch to gemini-1.5-pro which has better web search support
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    console.log('Using API endpoint:', apiUrl);
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Please search for information about: "${query}" and provide a helpful answer.`
            }
          ]
        }
      ],
      tools: [
        {
          googleSearch: {}
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    };
    
    console.log('Sending request with payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      apiUrl,
      payload,
      { 
        params: { key: GEMINI_API_KEY },
        timeout: 30000 
      }
    );
    
    console.log('Received response with status:', response.status);
    
    // Extract text from response
    let text = '';
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content) {
          
      const parts = response.data.candidates[0].content.parts;
      console.log('Found response parts:', parts.length);
      
      for (const part of parts) {
        if (part.text) {
          text += part.text;
        }
      }
    }
    
    console.log('Extracted text from response:', text.substring(0, 100) + '...');
    
    return [{ title: query, snippet: text || "No relevant information found." }];
  } catch (error) {
    console.error('Error performing web search:', error.message);
    
    // More detailed error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received, request was:', error.request);
    } else {
      console.error('Error details:', error.stack);
    }
    
    return [{ title: "Search Error", snippet: "Could not complete the search operation." }];
  }
}

module.exports = {
  getEmbeddings,
  getBatchEmbeddings,
  generateAnswer
};
