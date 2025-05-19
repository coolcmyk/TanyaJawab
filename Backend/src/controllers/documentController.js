const db = require('../config/databaseConfig');
const {getEmbeddings, generateAnswer} = require('../utils/geminiApi');
const qdrantController = require('../controllers/qdrantController');
const qdrant = require('../config/qdrantConfig');

const fs = require('fs');
const pdfParse = require('pdf-parse'); 

// Add this function for better text chunking
function chunkText(text, maxChunkSize = 2000, overlapSize = 200) {
  const chunks = [];
  
  // Clean and normalize text
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanedText.length <= maxChunkSize) {
    return [cleanedText];
  }
  
  let startIndex = 0;
  
  while (startIndex < cleanedText.length) {
    // Calculate end index
    let endIndex = Math.min(startIndex + maxChunkSize, cleanedText.length);
    
    // Try to end at a sentence or paragraph boundary
    if (endIndex < cleanedText.length) {
      // Look for sentence endings (., !, ?)
      const sentenceEndIndices = [];
      for (let i = startIndex + maxChunkSize / 2; i < endIndex; i++) {
        if ('.!?'.includes(cleanedText[i]) && (i + 1 === cleanedText.length || cleanedText[i + 1] === ' ')) {
          sentenceEndIndices.push(i + 1);
        }
      }
      
      // If we found sentence endings, use the last one
      if (sentenceEndIndices.length > 0) {
        endIndex = sentenceEndIndices[sentenceEndIndices.length - 1];
      } else {
        // Otherwise try to find a space
        const lastSpace = cleanedText.lastIndexOf(' ', endIndex);
        if (lastSpace > startIndex) {
          endIndex = lastSpace;
        }
      }
    }
    
    // Extract the chunk
    chunks.push(cleanedText.substring(startIndex, endIndex).trim());
    
    // Move to next chunk with overlap
    startIndex = endIndex - overlapSize;
    if (startIndex < 0) startIndex = 0;
  }
  
  return chunks;
}

exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await db.query(
      `SELECT id, user_id, original_filename, file_url, upload_timestamp
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

exports.getDocumentById = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    
    const { rows } = await db.query(
      `SELECT id, user_id, original_filename, file_url, upload_timestamp
       FROM documents
       WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Get parsed pages for this document
    const pagesQuery = await db.query(
      `SELECT page_number, extracted_text
       FROM parsed_pages
       WHERE document_id = $1
       ORDER BY page_number ASC`,
      [documentId]
    );
    
    const document = {
      ...rows[0],
      pages: pagesQuery.rows || []
    };
    
    res.status(200).json(document);
  } catch (error) {
    console.error('Error fetching document by ID:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { original_filename } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!original_filename || !file_url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert document into database
    const query = `
      INSERT INTO documents (user_id, original_filename, file_url, upload_timestamp)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const values = [userId, original_filename, file_url];
    const { rows } = await db.query(query, values);
    const document = rows[0];

    // Process PDF asynchronously to avoid memory issues
    processPdfInBackground(document, req.file.filename)
      .then(() => console.log(`Background processing of ${original_filename} completed`))
      .catch(err => console.error(`Error in background processing: ${err.message}`));

    // Return immediate success to the client
    res.status(201).json({
      ...document,
      message: 'Document uploaded successfully. Processing has begun in the background.',
      status: 'processing'
    });
  } catch (error) {
    console.error('Error uploading document:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New function to process PDFs in the background with memory management
async function processPdfInBackground(document, filename) {
  try {
    const filePath = `./uploads/${filename}`;
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Create a read stream instead of reading the whole file at once
    const dataStream = fs.createReadStream(filePath);
    
    // Set up options for PDF parsing with strict memory limits
    const options = {
      // Limit concurrent page processing
      max: 2,
      // Only extract text content
      pagerender: (pageData) => {
        return pageData.getTextContent()
          .then(content => {
            return content.items.map(item => item.str).join(' ');
          });
      }
    };

    // Process PDF with stream
    const pdfData = await new Promise((resolve, reject) => {
      const pdfParser = pdfParse(dataStream, options);
      pdfParser.then(resolve).catch(reject);
    });

    // Process pages individually instead of splitting by form feed
    const pageCount = pdfData.numpages;
    console.log(`Found ${pageCount} pages in the PDF`);
    
    // Track document progress
    await db.query(
      `UPDATE documents SET processing_status = 'processing', total_pages = $2 WHERE id = $1`,
      [document.id, pageCount]
    );
    
    // Process pages in smaller batches to manage memory
    const PAGE_BATCH_SIZE = 5;
    for (let i = 0; i < pageCount; i += PAGE_BATCH_SIZE) {
      const batchEndPage = Math.min(i + PAGE_BATCH_SIZE, pageCount);
      console.log(`Processing page batch ${i+1} to ${batchEndPage} of ${pageCount}`);
      
      // Process each page in the batch
      for (let pageNumber = i + 1; pageNumber <= batchEndPage; pageNumber++) {
        // Create a new stream and parser for each page to prevent memory buildup
        const pageStream = fs.createReadStream(filePath);
        const pageOptions = {
          ...options,
          pagerender: (pageData) => {
            // Only process the current page
            if (pageData.pageNumber === pageNumber) {
              return pageData.getTextContent()
                .then(content => {
                  return content.items.map(item => item.str).join(' ');
                });
            }
            return Promise.resolve(''); // Skip other pages
          },
          // Only render the specific page we need
          max: 1,
          pageNumber: pageNumber
        };
        
        try {
          const singlePageData = await pdfParse(pageStream, pageOptions);
          const pageText = singlePageData.text.trim();
          
          if (!pageText) {
            console.log(`Page ${pageNumber} is empty or contains no extractable text`);
            continue;
          }
          
          // For long pages, split into multiple chunks
          if (pageText.length > 2000) {
            const chunks = chunkText(pageText);
            
            for (let k = 0; k < chunks.length; k++) {
              const chunkNumber = k + 1;
              
              // Store chunk in database
              await db.query(
                `INSERT INTO parsed_pages (document_id, page_number, chunk_number, extracted_text)
                 VALUES ($1, $2, $3, $4)`,
                [document.id, pageNumber, chunkNumber, chunks[k]]
              );
            }
          } else {
            // Store page as-is
            await db.query(
              `INSERT INTO parsed_pages (document_id, page_number, extracted_text)
               VALUES ($1, $2, $3)`,
              [document.id, pageNumber, pageText]
            );
          }
          
          // Update progress
          await db.query(
            `UPDATE documents SET processed_pages = $2 WHERE id = $1`,
            [document.id, pageNumber]
          );
        } catch (pageError) {
          console.error(`Error processing page ${pageNumber}:`, pageError);
        } finally {
          // Close the page stream
          pageStream.destroy();
        }
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        } else {
          // Alternative memory management if --expose-gc not enabled
          // This creates an artificial delay to allow Node's GC to run
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Index page batch in Qdrant
      await indexPagesInQdrant(document.id, i + 1, batchEndPage);
      
      // Clear memory between batches
      if (global.gc) {
        global.gc();
      } else {
        // More aggressive memory clearing
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Update document status to processed
    await db.query(
      `UPDATE documents SET processing_status = 'completed' WHERE id = $1`,
      [document.id]
    );
    
    // Close the main stream
    dataStream.destroy();
    
    return true;
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Update document status to error
    await db.query(
      `UPDATE documents SET processing_status = 'error', error_message = $2 WHERE id = $1`,
      [document.id, error.message.substring(0, 255)]
    );
    
    throw error;
  }
}

// Helper function to index a batch of pages
async function indexPagesInQdrant(documentId, startPage, endPage) {
  try {
    // Get pages from database
    const { rows } = await db.query(
      `SELECT page_number, extracted_text 
       FROM parsed_pages 
       WHERE document_id = $1 AND page_number >= $2 AND page_number <= $3`,
      [documentId, startPage, endPage]
    );
    
    if (rows.length === 0) return;
    
    // Prepare chunks for Qdrant
    const chunks = rows.map(row => ({
      page_number: row.page_number,
      text: row.extracted_text
    }));
    
    // Create mock request and response objects
    const qdrantReq = {
      body: {
        chunks,
        documentId
      }
    };
    
    const qdrantRes = {
      status: function(code) {
        return this;
      },
      json: (data) => {
        return data;
      }
    };
    
    // Call Qdrant controller
    await qdrantController.upsertChunks(qdrantReq, qdrantRes);
    console.log(`Indexed pages ${startPage}-${endPage} for document ${documentId}`);
  } catch (error) {
    console.error(`Error indexing pages ${startPage}-${endPage}:`, error);
  }
}

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

exports.askDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;
    const { question } = req.body;

    console.log(`Received question for document ${documentId}: "${question}"`);

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // First check if the document exists and belongs to the user
    const docCheck = await db.query(
      `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );
    
    if (docCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    try {
      // Get embeddings for the question
      console.log("Generating embedding for question...");
      const [questionEmbedding] = await getEmbeddings([question]);
      
      // Query Qdrant to find the most relevant chunks
      console.log("Searching for relevant document chunks in Qdrant...");
      const COLLECTION_NAME = 'doc_chunks';
      const topK = 3; // Retrieve top 3 most relevant chunks
      
      const searchResults = await qdrant.search(COLLECTION_NAME, {
        vector: questionEmbedding,
        limit: topK,
        filter: {
          must: [{ key: 'document_id', match: { value: documentId } }],
        },
      });
      
      if (!searchResults || searchResults.length === 0) {
        console.log("No relevant chunks found in vector database, falling back to full document context");
        // Fall back to traditional method if no chunks found
        const pagesQuery = await db.query(
          `SELECT page_number, extracted_text FROM parsed_pages WHERE document_id = $1 ORDER BY page_number ASC`,
          [documentId]
        );
        
        if (pagesQuery.rows.length === 0) {
          return res.status(200).json({ answer: "Tidak ada konten yang tersedia untuk dokumen ini. Dokumen mungkin belum diproses atau tidak memiliki teks yang dapat dibaca." });
        }
        
        // Use traditional context
        const context = pagesQuery.rows
          .map(page => `Page ${page.page_number}: ${page.extracted_text}`)
          .join('\n\n');
          
        const answer = await generateAnswer(context, question);
        
        return res.status(200).json({ answer });
      }
      
      // Prepare the context from the retrieved chunks
      const retrievedChunks = searchResults.map(result => ({
        page_number: result.payload.page_number,
        text: result.payload.text,
        score: result.score
      }));
      
      console.log(`Found ${retrievedChunks.length} relevant chunks`);
      
      // Create context from the retrieved chunks with page numbers
      const context = retrievedChunks
        .map(chunk => `Page ${chunk.page_number}: ${chunk.text}`)
        .join('\n\n');
      
      // Use Gemini API to generate an answer based on the RAG context
      console.log("Calling Gemini API with RAG context...");
      const answer = await generateAnswer(context, question);
      console.log("Received answer from Gemini API");
      
      // Log the interaction for future reference
      console.log(`Question from user ${userId} about document ${documentId}: "${question}"`);
      
      res.status(200).json({ 
        answer,
        // Include for debugging, can be removed in production
        debug: {
          retrievedChunks: retrievedChunks.map(chunk => ({
            page: chunk.page_number,
            score: chunk.score
          }))
        }
      });
    } catch (apiError) {
      console.error("Error in RAG process:", apiError.message);
      
      // If the RAG process fails, return a fallback response
      res.status(200).json({ 
        answer: "Maaf, saya tidak dapat menjawab pertanyaan Anda saat ini. Silakan coba lagi nanti.",
        error: "API error" 
      });
    }
  } catch (error) {
    console.error('Error processing question:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Internal server error' });
  }
};