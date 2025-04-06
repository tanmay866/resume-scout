const { pool } = require('./config/db');

async function updateDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to database');

    // Update resumes table - modify status enum
    console.log('Updating resumes table status enum...');
    try {
      await connection.execute(`
        ALTER TABLE resumes 
        MODIFY COLUMN status ENUM('pending', 'processing', 'processing_limited', 'processed', 'processed_with_errors', 'error') 
        DEFAULT 'pending'
      `);
      console.log('Successfully updated resumes table status enum');
    } catch (error) {
      console.error('Error updating resumes table:', error.message);
    }

    // Add location column to resume_data if it doesn't exist
    console.log('Adding location column to resume_data if needed...');
    try {
      // Check if column exists
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'resume_data' 
        AND COLUMN_NAME = 'location'
      `);
      
      if (columns.length === 0) {
        await connection.execute(`
          ALTER TABLE resume_data
          ADD COLUMN location TEXT AFTER address
        `);
        console.log('Successfully added location column to resume_data');
      } else {
        console.log('Location column already exists in resume_data');
      }
    } catch (error) {
      console.error('Error adding location column:', error.message);
    }

    // Add resume_strength column to feedback if it doesn't exist
    console.log('Adding resume_strength column to feedback if needed...');
    try {
      // Check if column exists
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'feedback' 
        AND COLUMN_NAME = 'resume_strength'
      `);
      
      if (columns.length === 0) {
        await connection.execute(`
          ALTER TABLE feedback
          ADD COLUMN resume_strength INT DEFAULT 5 AFTER feedback_text
        `);
        console.log('Successfully added resume_strength column to feedback');
      } else {
        console.log('resume_strength column already exists in feedback');
      }
    } catch (error) {
      console.error('Error adding resume_strength column:', error.message);
    }

    console.log('Database update complete');
  } catch (error) {
    console.error('Database update failed:', error);
  } finally {
    if (connection) {
      connection.release();
      console.log('Database connection released');
    }
    // Exit process
    process.exit(0);
  }
}

// Run the update
updateDatabase(); 