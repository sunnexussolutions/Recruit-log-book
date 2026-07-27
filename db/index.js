// ============================================================
// NEON SERVERLESS POSTGRES CONNECTION CLIENT
// ============================================================

const { Pool, neonConfig } = require('@neondatabase/serverless');
require('dotenv').config();

// Enable WebSocket / HTTP pooling for Neon
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is not defined in .env. Falling back to local storage server mode.');
}

const pool = connectionString ? new Pool({ connectionString }) : null;

module.exports = {
  query: (text, params) => {
    if (!pool) {
      throw new Error('Neon Database connection pool not initialized. Please configure DATABASE_URL in .env');
    }
    return pool.query(text, params);
  },
  pool
};
