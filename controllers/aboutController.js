/**
 * About Controller
 */

// Get about page
exports.getAboutPage = (req, res) => {
  res.render('pages/about', {
    title: 'About Us',
    user: req.session.user || null
  });
}; 