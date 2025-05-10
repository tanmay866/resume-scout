import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white mt-auto py-5">
      <div className="container">
        <div className="row">
          {/* About Column */}
          <div className="col-md-3 mb-4">
            <h3 className="h5 mb-3">Resume Scout</h3>
            <p>We use AI to help you optimize your resume and find the perfect job match.</p>
          </div>
          
          {/* Quick Links */}
          <div className="col-md-3 mb-4">
            <h3 className="h5 mb-3">Quick Links</h3>
            <ul className="list-unstyled">
              <li className="mb-2"><Link href="/" className="text-white text-decoration-none hover-opacity">Home</Link></li>
              <li className="mb-2"><Link href="/about" className="text-white text-decoration-none hover-opacity">About Us</Link></li>
              <li className="mb-2"><Link href="/upload-resume" className="text-white text-decoration-none hover-opacity">Upload Resume</Link></li>
              <li className="mb-2"><Link href="/job-matching" className="text-white text-decoration-none hover-opacity">Job Matching</Link></li>
              <li className="mb-2"><Link href="/contact" className="text-white text-decoration-none hover-opacity">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-md-3 mb-4">
            <h3 className="h5 mb-3">Resources</h3>
            <ul className="list-unstyled">
              <li className="mb-2"><Link href="/faq" className="text-white text-decoration-none hover-opacity">FAQ</Link></li>
              <li className="mb-2"><Link href="/chatbot" className="text-white text-decoration-none hover-opacity">AI Assistant</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="col-md-3 mb-4">
            <h3 className="h5 mb-3">Contact Us</h3>
            <ul className="list-unstyled">
              <li className="mb-2 d-flex">
                <i className="fas fa-map-marker-alt mt-1 me-2"></i>
                <span>Gujarat, India</span>
              </li>
              <li className="mb-2 d-flex">
                <i className="fas fa-phone me-2"></i>
                <span>+91 9876543210</span>
              </li>
              <li className="mb-2 d-flex">
                <i className="fas fa-envelope me-2"></i>
                <span>info@resumescout.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4 bg-light" />
        
        <div className="text-center">
          <p className="mb-0">&copy; {currentYear} Resume Scout. All rights reserved.</p>
        </div>
      </div>
      
      {/* Floating AI Chat Button */}
      <Link href="/chatbot" className="position-fixed bottom-0 end-0 m-4 bg-info text-white rounded-circle p-3 shadow-lg">
        <i className="fas fa-robot fs-4"></i>
        <span className="visually-hidden">AI Assistant</span>
      </Link>
    </footer>
  );
}
