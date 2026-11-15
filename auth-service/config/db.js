const { Pool } = require('pg');
const path = require('path');

// Load .env from current service directory, fallback to root .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
}

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not defined in environment variables.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,                    
  keepAliveInitialDelayMillis: 10000  
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)

})

module.exports = pool