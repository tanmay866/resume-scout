/**
 * Home Controller
 */

// Get home page
exports.getHomePage = (req, res) => {
  res.render('pages/home', {
    title: 'Home',
    user: req.session.user || null
  });
}; 