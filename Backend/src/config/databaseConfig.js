const { Pool } = require('pg');
let pool;


const getConnection = () => {
  if (pool) return pool;
  
  console.log("Creating new database connection pool");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Critical connection settings for serverless:
    max: 3, // Use only one connection in the pool for serverless
    connectionTimeoutMillis: 8000, // 8 second timeout (under Vercel's limit)
    idleTimeoutMillis: 8000, // Close idle connections quickly
    maxRetries: 3,
    retryDelay: 1000 // 1 second between retries
  
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err);
    pool = null; 
  });
  return pool;
};

async function query(text, params = []) {
  const start = Date.now();
  try {
    const pool = getConnection();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query took ${duration}ms: ${text}`);
    return res;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

module.exports = { query, getConnection };