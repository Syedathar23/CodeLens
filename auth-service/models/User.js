const pool = require('../config/db');

const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, github_url, is_verified, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const createUser = async (name, email, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
};

const updateUser = async (id, fields) => {
  const result = await pool.query(
    `UPDATE users SET updated_at = NOW() WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = { findByEmail, findById, createUser, updateUser };
