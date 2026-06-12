const express = require('express');
const router = express.Router();
const { register, login, updateAvatar, getAvatar } = require('../controllers/authController');
const authenticationToken = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);

module.exports = router;