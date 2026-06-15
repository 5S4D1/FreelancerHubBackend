const express = require('express');
const router = express.Router();
const { all_users } = require('../controllers/userController');
const authenticationToken = require('../middlewares/authMiddleware');

// Get all users (for testing/demo)
router.get('/users', authenticationToken, all_users);

module.exports = router;