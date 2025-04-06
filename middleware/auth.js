// Authentication middleware
exports.isAuthenticated = (req, res, next) => {
  // For browser sessions
  if (req.session && req.session.user) {
    return next();
  }
  
  // For API access (using Authorization header)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // In a real implementation, you would validate the token
    // For example, verify JWT token or check against stored API keys
    if (token === process.env.API_ACCESS_TOKEN) {
      return next();
    }
  }
  
  // If no valid session or token
  if (req.xhr || req.path.startsWith('/api/')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  // For regular browser requests, redirect to login
  return res.redirect('/auth/login');
}; 

// Middleware to check if a user is authenticated for routes that should be restricted
exports.checkAuth = (req, res, next) => {
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',                  // Home page
    '/about',             // About page
    '/auth/login',        // Login page
    '/auth/register',     // Registration page
    '/auth/logout'        // Logout action should always be accessible
  ];
  
  // Check if the current path matches any of the public routes
  const isPublicRoute = publicRoutes.some(route => req.path === route || req.path.startsWith(route + '/'));
  
  // If it's a public route or user is authenticated, proceed
  if (isPublicRoute || (req.session && req.session.user)) {
    return next();
  }
  
  // Otherwise redirect to login
  return res.redirect('/auth/login?error=Please log in to access this page');
}; 