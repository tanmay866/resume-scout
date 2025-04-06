/**
 * Authentication Controller
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Get register page
exports.getRegisterPage = (req, res) => {
  res.render('pages/register', {
    title: 'Register',
    user: req.session.user || null
  });
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.render('pages/register', {
        title: 'Register',
        error: 'All fields are required',
        name,
        email,
        user: req.session.user || null
      });
    }
    
    if (password !== confirmPassword) {
      return res.render('pages/register', {
        title: 'Register',
        error: 'Passwords do not match',
        name,
        email,
        user: req.session.user || null
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user already exists
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (rows.length > 0) {
        return res.render('pages/register', {
          title: 'Register',
          error: 'Email already registered',
          name,
          user: req.session.user || null
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      
      const userId = result.insertId;
      
      // Set session
      req.session.user = {
        id: userId,
        name,
        email,
        role: 'user',
        profile_picture: null,
        phone: null,
        location: null,
        job_title: null,
        company: null
      };
      
      // Redirect to home page
      res.redirect('/');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.render('pages/register', {
      title: 'Register',
      error: 'An error occurred during registration',
      name: req.body.name,
      email: req.body.email,
      user: req.session.user || null
    });
  }
};

// Get login page
exports.getLoginPage = (req, res) => {
  res.render('pages/login', {
    title: 'Login',
    user: req.session.user || null
  });
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.render('pages/login', {
        title: 'Login',
        error: 'Email and password are required',
        email,
        user: req.session.user || null
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Get user
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (rows.length === 0) {
        return res.render('pages/login', {
          title: 'Login',
          error: 'Invalid email or password',
          email,
          user: req.session.user || null
        });
      }
      
      const user = rows[0];
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.render('pages/login', {
          title: 'Login',
          error: 'Invalid email or password',
          email,
          user: req.session.user || null
        });
      }
      
      // Set session
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        phone: user.phone,
        location: user.location,
        job_title: user.job_title,
        company: user.company
      };
      
      // Redirect to home page
      res.redirect('/');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('pages/login', {
      title: 'Login',
      error: 'An error occurred during login',
      email: req.body.email,
      user: req.session.user || null
    });
  }
};

// Logout user
exports.logoutUser = (req, res) => {
  // Destroy session
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
}; 