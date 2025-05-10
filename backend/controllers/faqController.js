/**
 * FAQ Controller
 */

// Get FAQ page
exports.getFaqPage = (req, res) => {
  // FAQ data
  const faqs = [
    {
      question: 'What is Resume Scout?',
      answer: 'Resume Scout is an AI-powered resume analyzer that helps match candidates with job descriptions. It extracts key information from resumes and provides feedback for improvement.'
    },
    {
      question: 'How does the AI analyze my resume?',
      answer: 'Our AI uses natural language processing (NLP) to extract information from your resume including skills, experience, education, and more. It then uses this information to match with job descriptions and provide feedback.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'Resume Scout currently supports PDF (.pdf) and Word (.doc, .docx) files. We recommend using PDF format for best results.'
    },
    {
      question: 'Is my resume data secure?',
      answer: 'Yes, we take data security seriously. Your resume data is encrypted and stored securely. We do not share your information with third parties without your consent.'
    },
    {
      question: 'How accurate is the job matching?',
      answer: 'Our job matching algorithm has a high degree of accuracy, but it\'s continuously improving. The matching score is based on skills, experience, and keywords found in both the resume and job description.'
    },
    {
      question: 'Can I get feedback on my resume?',
      answer: 'Yes, after uploading your resume, you\'ll receive AI-generated feedback on how to improve it for better job matches.'
    },
    {
      question: 'Is Resume Scout free to use?',
      answer: 'Resume Scout offers both free and premium plans. The free plan allows for basic resume analysis, while premium plans offer advanced features like detailed feedback and unlimited job matching.'
    },
    {
      question: 'How can employers use Resume Scout?',
      answer: 'Employers can enter job descriptions and find candidates that best match their requirements. This saves time in the hiring process by filtering candidates based on relevant skills and experience.'
    }
  ];
  
  res.render('pages/faq', {
    title: 'Frequently Asked Questions',
    faqs,
    user: req.session.user || null
  });
}; 