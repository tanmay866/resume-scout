/**
 * Job Matching Controller
 */
const { pool } = require('../config/db');

// Get job matching page
exports.getJobMatchingPage = (req, res) => {
  res.render('pages/job-matching', {
    title: 'Job Matching',
    user: req.session.user || null
  });
};

// Match job with candidates
exports.matchJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required'
      });
    }
    
    // Use actual user data for the first candidate if available
    const userData = req.session.user;
    const userName = userData ? userData.name : 'N/A';
    const userEmail = userData ? userData.email : 'N/A';
    
    // For demo purposes, return dummy candidates with match scores
    // In a real implementation, this would use AI/ML to match job descriptions with resumes
    const dummyMatches = [
      {
        id: 1,
        name: userName,
        email: userEmail,
        score: 87,
        skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MySQL']
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        score: 75,
        skills: ['JavaScript', 'Angular', 'Node.js', 'MongoDB']
      },
      {
        id: 3,
        name: 'Michael Johnson',
        email: 'michael.johnson@example.com',
        score: 68,
        skills: ['JavaScript', 'Vue.js', 'Python', 'Django']
      },
      {
        id: 4,
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        score: 52,
        skills: ['HTML', 'CSS', 'JavaScript', 'jQuery']
      },
      {
        id: 5,
        name: 'Robert Wilson',
        email: 'robert.wilson@example.com',
        score: 45,
        skills: ['PHP', 'Laravel', 'MySQL', 'JavaScript']
      }
    ];
    
    // Simple keyword matching to simulate AI matching
    const keywords = jobDescription.toLowerCase().split(/\s+/);
    const matches = dummyMatches.map(candidate => {
      // Adjust score based on keywords in job description
      let adjustedScore = candidate.score;
      
      // Check if skills match keywords
      const matchedSkills = candidate.skills.filter(skill => 
        keywords.some(keyword => skill.toLowerCase().includes(keyword))
      );
      
      // Adjust score based on matched skills
      adjustedScore += matchedSkills.length * 2;
      
      // Cap score at 100
      if (adjustedScore > 100) adjustedScore = 100;
      
      return {
        ...candidate,
        score: adjustedScore
      };
    });
    
    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    // Delay response for demo purposes to simulate processing time
    setTimeout(() => {
      res.json({
        success: true,
        matches
      });
    }, 1500);
    
  } catch (error) {
    console.error('Error during job matching:', error);
    res.status(500).json({
      success: false,
      error: 'Error during job matching'
    });
  }
}; 