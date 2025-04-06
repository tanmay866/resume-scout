/**
 * Profile Controller
 */
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const multer = require('multer');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads/profile');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.session.user.id;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${userId}-${Date.now()}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and GIF images are allowed.'));
  }
};

// Initialize multer with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
}).single('profile_picture');

// Get profile page
exports.getProfilePage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Get user data
    const [rows] = await db.pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).render('pages/404', {
        title: 'User Not Found',
        user: req.session.user || null
      });
    }
    
    const userData = rows[0];
    
    // Get user's resumes
    const [resumes] = await db.pool.execute(
      `SELECT r.id, r.filename, r.original_filename, r.status, r.uploaded_at
       FROM resumes r
       WHERE r.user_id = ?
       ORDER BY r.uploaded_at DESC`,
      [userId]
    );
    
    res.render('pages/profile', {
      title: 'My Profile',
      userData,
      resumes,
      success: req.query.success,
      error: req.query.error,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      message: 'Error fetching profile',
      user: req.session.user || null
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const {
      name,
      email,
      phone,
      location,
      bio,
      job_title,
      company,
      website,
      linkedin,
      github,
      skills
    } = req.body;
    
    // Validate email
    if (email) {
      // Check if email already exists for another user
      const [emailCheck] = await db.pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (emailCheck.length > 0) {
        return res.redirect('/profile?error=Email already in use by another account');
      }
    }
    
    // Update user data
    await db.pool.execute(
      `UPDATE users SET 
        name = ?,
        email = ?,
        phone = ?,
        location = ?,
        bio = ?,
        job_title = ?,
        company = ?,
        website = ?,
        linkedin = ?,
        github = ?,
        skills = ?
       WHERE id = ?`,
      [
        name, 
        email, 
        phone || null, 
        location || null,
        bio || null,
        job_title || null,
        company || null,
        website || null,
        linkedin || null,
        github || null,
        skills || null,
        userId
      ]
    );
    
    // Update session data
    req.session.user.name = name;
    req.session.user.email = email;
    // Update other relevant session data
    req.session.user.phone = phone || null;
    req.session.user.location = location || null;
    req.session.user.job_title = job_title || null;
    req.session.user.company = company || null;
    
    res.redirect('/profile?success=Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.redirect('/profile?error=Error updating profile');
  }
};

// Upload profile picture
exports.uploadProfilePicture = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Profile picture upload error:', err);
      return res.redirect('/profile?error=' + encodeURIComponent(err.message));
    }
    
    if (!req.file) {
      return res.redirect('/profile?error=No file uploaded');
    }
    
    try {
      const userId = req.session.user.id;
      const filePath = '/uploads/profile/' + path.basename(req.file.path);
      
      // First retrieve existing profile picture (if any)
      const [user] = await db.pool.execute(
        'SELECT profile_picture FROM users WHERE id = ?',
        [userId]
      );
      
      const existingPicture = user[0].profile_picture;
      
      // Update profile picture path in database
      await db.pool.execute(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [filePath, userId]
      );
      
      // Update the session with the new profile picture
      req.session.user.profile_picture = filePath;
      
      // If there was a previous picture, try to delete it
      if (existingPicture) {
        const oldFilePath = path.join(__dirname, '../public', existingPicture);
        // Only delete if file exists and isn't a default image
        if (fs.existsSync(oldFilePath) && !existingPicture.includes('default-avatar')) {
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting old profile picture:', unlinkErr);
            }
          });
        }
      }
      
      res.redirect('/profile?success=Profile picture updated successfully');
    } catch (error) {
      console.error('Error saving profile picture path:', error);
      res.redirect('/profile?error=Error saving profile picture');
    }
  });
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    console.log('Delete resume request received');
    
    // Check for session
    if (!req.session || !req.session.user || !req.session.user.id) {
      console.error('No user session found:', req.session);
      return res.redirect('/auth/login?error=Session expired. Please log in again');
    }
    
    const resumeId = req.params.id;
    const userId = req.session.user.id;
    
    console.log(`Attempting to delete resume with ID ${resumeId} for user ${userId}`);
    
    // Verify that the resume belongs to the current user
    const [resumeRows] = await db.pool.execute(
      'SELECT * FROM resumes WHERE id = ? AND user_id = ?',
      [resumeId, userId]
    );
    
    if (resumeRows.length === 0) {
      console.log(`Resume not found or unauthorized: ${resumeId}`);
      return res.redirect('/profile?error=Resume not found or you do not have permission to delete it');
    }
    
    const resume = resumeRows[0];
    console.log(`Found resume: ${resume.original_filename}`);
    
    // Delete each related record individually
    console.log('Deleting resume skills...');
    await db.pool.execute('DELETE FROM resume_skills WHERE resume_id = ?', [resumeId]);
    
    console.log('Deleting resume job matches...');
    await db.pool.execute('DELETE FROM resume_job_matches WHERE resume_id = ?', [resumeId]);
    
    console.log('Deleting resume data...');
    await db.pool.execute('DELETE FROM resume_data WHERE resume_id = ?', [resumeId]);
    
    console.log('Deleting resume record...');
    await db.pool.execute('DELETE FROM resumes WHERE id = ?', [resumeId]);
    
    // Delete the actual file
    if (resume.file_path) {
      const filePath = path.join(__dirname, '..', resume.file_path);
      console.log(`Checking for file at: ${filePath}`);
      if (fs.existsSync(filePath)) {
        console.log(`Deleting file: ${filePath}`);
        fs.unlinkSync(filePath);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }
    
    console.log('Resume deletion successful');
    return res.redirect('/profile?success=Resume deleted successfully');
  } catch (error) {
    console.error('Error deleting resume:', error);
    return res.redirect('/profile?error=Error deleting resume: ' + error.message);
  }
};

// Remove profile picture
exports.removeProfilePicture = async (req, res) => {
  try {
    console.log('Remove profile picture request received');
    
    // Check for session
    if (!req.session || !req.session.user || !req.session.user.id) {
      console.error('No user session found:', req.session);
      return res.redirect('/auth/login?error=Session expired. Please log in again');
    }
    
    const userId = req.session.user.id;
    console.log(`Removing profile picture for user ID: ${userId}`);
    
    // Get current profile picture
    const [user] = await db.pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user || user.length === 0) {
      console.error(`User with ID ${userId} not found`);
      return res.redirect('/profile?error=User not found');
    }
    
    const existingPicture = user[0].profile_picture;
    console.log(`Current profile picture: ${existingPicture}`);
    
    // Delete the physical file if it exists and isn't the default avatar
    if (existingPicture && !existingPicture.includes('default-avatar')) {
      const filePath = path.join(__dirname, '../public', existingPicture);
      console.log(`Checking file path: ${filePath}`);
      
      if (fs.existsSync(filePath)) {
        console.log(`Deleting file: ${filePath}`);
        fs.unlinkSync(filePath);
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }
    
    // Set profile picture to null in database
    await db.pool.execute(
      'UPDATE users SET profile_picture = NULL WHERE id = ?',
      [userId]
    );
    console.log('Database updated successfully');
    
    // Update session
    req.session.user.profile_picture = null;
    console.log('Session updated successfully');
    
    res.redirect('/profile?success=Profile picture removed successfully');
  } catch (error) {
    console.error('Error removing profile picture:', error);
    res.redirect('/profile?error=Error removing profile picture: ' + error.message);
  }
}; 