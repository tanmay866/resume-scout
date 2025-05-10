const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration with fallback for serverless environments
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 5 : 10, // Lower connection limit for serverless
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0, // Prevents connection timeouts
};

// Add SSL configuration for production environments (like PlanetScale)
if (process.env.NODE_ENV === 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: true
  };
}

// Create a connection pool
let pool;

// Get or create the connection pool
function getPool() {
  if (!pool) {
    console.log('Creating new database connection pool');
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Helper function to execute queries with connection retry
async function query(sql, params, retries = 3) {
  try {
    const currentPool = getPool();
    const [results] = await currentPool.execute(sql, params);
    return [results, null];
  } catch (error) {
    console.error(`Database query error: ${error.message}`);
    
    // If connection error and we have retries left, try again
    if (error.code === 'ECONNREFUSED' && retries > 0) {
      console.log(`Retrying database connection... (${retries} attempts left)`);
      pool = null; // Reset the pool
      return await query(sql, params, retries - 1);
    }
    
    return [null, error];
  }
}

// Test database connection
async function testConnection() {
  try {
    const currentPool = getPool();
    const connection = await currentPool.getConnection();
    console.log('Database connected successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    return false;
  }
}

// Export the pool directly instead of as an object property
module.exports = {
  getPool,
  query,
  testConnection
}; 