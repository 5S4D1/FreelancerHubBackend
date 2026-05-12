const express = require('express');
const { updateAvatar, getAvatar } = require('../controllers/avatarController');
const authenticationToken = require('../middleware/authMiddleware');
const uploadAvatar = require('../middleware/uploadAvatar');

const router = express.Router();

router.put('/avatar', authenticationToken, uploadAvatar.single('avatar'), updateAvatar);
router.get('/avatar', authenticationToken, getAvatar);

module.exports = router;
