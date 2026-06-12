const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/messages', authMiddleware, messagesController.sendMessage);
router.get('/messages/:conversation_id', authMiddleware, messagesController.getMessages);

module.exports = router;
