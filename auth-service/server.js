require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const pool = require('./config/db');
const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use('/auth', authRoutes);
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});
const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
startServer();