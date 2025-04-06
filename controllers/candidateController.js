/**
 * Candidate Controller
 */
const { pool } = require('../config/db');

// Get candidate profile page
exports.getCandidateProfile = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.session.user ? req.session.user.id : null;
    const connection = await pool.getConnection();
    
    try {
      // Get resume data
      const [resumeRows] = await connection.execute(`
        SELECT r.*, rd.name, rd.email, rd.phone, rd.address, rd.summary, r.user_id
        FROM resumes r
        LEFT JOIN resume_data rd ON r.id = rd.resume_id
        WHERE r.id = ?
      `, [resumeId]);
      
      if (resumeRows.length === 0) {
        return res.status(404).render('pages/404', {
          title: 'Candidate Not Found',
          user: req.session.user || null
        });
      }
      
      const resumeData = resumeRows[0];
      
      // If this resume belongs to the logged-in user, use their current name
      if (userId && resumeData.user_id === userId) {
        resumeData.name = req.session.user.name;
        resumeData.email = req.session.user.email;
        resumeData.phone = req.session.user.phone || resumeData.phone || 'N/A';
      }
      
      // Get skills
      const [skillRows] = await connection.execute(`
        SELECT s.name
        FROM resume_skills rs
        JOIN skills s ON rs.skill_id = s.id
        WHERE rs.resume_id = ?
      `, [resumeId]);
      
      const skills = skillRows.map(row => row.name);
      
      // Get job matches
      const [matchRows] = await connection.execute(`
        SELECT rjm.match_score, jp.title, jp.company
        FROM resume_job_matches rjm
        JOIN job_postings jp ON rjm.job_id = jp.id
        WHERE rjm.resume_id = ?
        ORDER BY rjm.match_score DESC
        LIMIT 5
      `, [resumeId]);
      
      // If no matches exist, create some dummy matches for demo
      let matches = matchRows;
      if (matches.length === 0) {
        matches = [
          { match_score: 85, title: 'Senior Software Developer', company: 'Tech Solutions Inc.' },
          { match_score: 78, title: 'Full Stack Developer', company: 'Digital Innovations' },
          { match_score: 65, title: 'JavaScript Developer', company: 'WebApp Studios' }
        ];
      }
      
      res.render('pages/candidate', {
        title: resumeData.name || 'Candidate Profile',
        resume: resumeData,
        skills,
        matches,
        user: req.session.user || null
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    res.status(500).render('pages/error', {
      title: 'Server Error',
      message: 'Error fetching candidate profile',
      user: req.session.user || null
    });
  }
};

// Get candidate feedback
exports.getCandidateFeedback = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const connection = await pool.getConnection();
    
    try {
      // Get feedback
      const [feedbackRows] = await connection.execute(`
        SELECT feedback_text, created_at
        FROM feedback
        WHERE resume_id = ?
        ORDER BY created_at DESC
      `, [resumeId]);
      
      // If no feedback exists, create dummy feedback for demo
      let feedback = feedbackRows;
      if (feedback.length === 0) {
        feedback = [{
          feedback_text: 'Your resume could be improved by adding more quantifiable achievements. Also, consider adding a professional summary section.',
          created_at: new Date()
        }];
      }
      
      res.json({
        success: true,
        feedback
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching candidate feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching feedback'
    });
  }
}; 