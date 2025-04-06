const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return [results, null];
  } catch (error) {
    console.error('Database query error:', error.message);
    return [null, error];
  }
}

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// Export the pool directly instead of as an object property
module.exports = {
  pool,
  query,
  testConnection
}; 