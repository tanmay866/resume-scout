/**
 * Contact Controller
 */
const db = require('../config/db');

// Get contact page
exports.getContactPage = (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us',
    user: req.session.user || null
  });
};

// Simple form submission handler with redirect
exports.simpleSubmitForm = async (req, res) => {
  try {
    console.log('Received simple form submission:', req.body);
    const { name, email, message } = req.body;
    
    // Validate form data
    if (!name || !email || !message) {
      console.log('Missing required fields:', { name, email, message });
      return res.redirect('/contact?error=All fields are required');
    }
    
    try {
      console.log('Attempting database connection...');
      // Try a simpler approach by using pool directly
      const [result] = await db.pool.execute(
        'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
        [name, email, message]
      );
      
      console.log('Message submitted successfully, ID:', result.insertId);
      
      return res.redirect('/contact?success=Your message has been sent successfully. We will get back to you soon!');
    } catch (dbError) {
      console.error('Database error details:', {
        code: dbError.code,
        errno: dbError.errno,
        sqlMessage: dbError.sqlMessage,
        sqlState: dbError.sqlState,
        sql: dbError.sql
      });
      
      return res.redirect('/contact?error=Database error. Please try again later.');
    }
  } catch (error) {
    console.error('Error in contact form submission:', error);
    return res.redirect('/contact?error=Error submitting message. Please try again later.');
  }
};

// Submit contact form
exports.submitContactForm = async (req, res) => {
  try {
    console.log('Received contact form submission:', req.body);
    const { name, email, message } = req.body;
    
    // Validate form data
    if (!name || !email || !message) {
      console.log('Missing required fields:', { name, email, message });
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    try {
      console.log('Attempting database connection...');
      // Try a simpler approach by using pool directly
      const [result] = await db.pool.execute(
        'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
        [name, email, message]
      );
      
      console.log('Message submitted successfully, ID:', result.insertId);
      
      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!'
      });
    } catch (dbError) {
      console.error('Database error details:', {
        code: dbError.code,
        errno: dbError.errno,
        sqlMessage: dbError.sqlMessage,
        sqlState: dbError.sqlState,
        sql: dbError.sql
      });
      
      return res.status(500).json({
        success: false,
        message: 'Database error. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Error in contact form submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting message. Please try again later.'
    });
  }
}; 