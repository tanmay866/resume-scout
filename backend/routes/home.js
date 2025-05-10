const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page route
router.get('/', homeController.getHomePage);

module.exports = router; 