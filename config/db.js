
// config/db.js
const { Pool } = require('pg');
require('dotenv').config();
//Neon db configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // needed for Neon
  },
});

pool.connect()
  .then(() => console.log('Connected to Neon PostgreSQL!'))
  .catch((err) => console.error('DB connection error:', err));

module.exports = pool;

