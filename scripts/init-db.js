// ============================================================
// RECRUIT LOGBOOK - NEON DATABASE INITIALIZATION SCRIPT
// ============================================================

const fs = require('fs');
const path = require('path');
const db = require('../db/index');

async function initDatabase() {
  console.log('🚀 Connecting to Neon Postgres Database...');
  
  if (!db.pool) {
    console.error('❌ Error: DATABASE_URL is not set in .env file!');
    console.log('Please copy .env.example to .env and add your Neon Postgres connection URL.');
    process.exit(1);
  }

  try {
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing db/schema.sql...');
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const stmt of statements) {
      try {
        await db.query(stmt);
      } catch (stmtErr) {
        console.warn('⚠️ Statement warning:', stmtErr.message);
      }
    }

    console.log('✅ Neon Database tables, indexes, and seed data created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database Initialization Failed:', err);
    process.exit(1);
  }
}

initDatabase();
