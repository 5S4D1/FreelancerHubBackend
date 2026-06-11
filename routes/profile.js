const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateUser_id } = require('../controllers/profileController');
const authenticationToken = require('../middleware/authMiddleware');

router.get('/profile', authenticationToken, getProfile);
router.put('/profile', authenticationToken, updateProfile);

// Route for update user id
router.put('/profile/uid', authenticationToken, updateUser_id);

module.exports = router;