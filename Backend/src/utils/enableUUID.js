const db = require('../config/databaseConfig');

async function enableUuidExtension() {
  try {
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('UUID extension enabled successfully');
  } catch (error) {
    console.error('Failed to enable UUID extension:', error);
  } finally {
    process.exit();
  }
}

enableUuidExtension();