const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversationsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/conversations', authMiddleware, conversationsController.startConversation);
router.get('/conversations/:user_id', authMiddleware, conversationsController.listConversations);

module.exports = router;
