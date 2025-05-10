import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link href="/" className="navbar-brand">
          <span className="fw-bold">Resume Scout</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMobileMenu}
          aria-controls="navbarNav" 
          aria-expanded={mobileMenuOpen ? "true" : "false"} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/" className={`nav-link ${router.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/about" className={`nav-link ${router.pathname === '/about' ? 'active' : ''}`}>
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/upload-resume" className={`nav-link ${router.pathname === '/upload-resume' ? 'active' : ''}`}>
                Upload Resume
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/job-matching" className={`nav-link ${router.pathname === '/job-matching' ? 'active' : ''}`}>
                Job Matching
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/chatbot" className={`nav-link ${router.pathname === '/chatbot' ? 'active' : ''}`}>
                AI Assistant
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${router.pathname === '/contact' ? 'active' : ''}`}>
                Contact
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/faq" className={`nav-link ${router.pathname === '/faq' ? 'active' : ''}`}>
                FAQ
              </Link>
            </li>
          </ul>
          
          <div className="d-flex">
            {user ? (
              <div className="dropdown">
                <a 
                  className="btn btn-outline-light dropdown-toggle" 
                  href="#" 
                  role="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <img 
                    src={user.profile_picture || '/images/default-avatar.png'} 
                    alt="Profile" 
                    className="rounded-circle me-2" 
                    style={{ width: '24px', height: '24px', objectFit: 'cover' }} 
                  />
                  {user.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <Link href="/profile" className="dropdown-item">
                      My Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link href="/api/auth/logout" className="dropdown-item">
                      Logout
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline-light me-2">
                  Login
                </Link>
                <Link href="/register" className="btn btn-light">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
