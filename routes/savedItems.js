const express = require('express');
const router = express.Router();
const { saveItem, getSavedItems, removeSavedItem } = require('../controllers/savedItemsController');
const authenticationToken = require('../middlewares/authMiddleware');

// Save an item
router.post('/saved-items', authenticationToken, saveItem);

// Get all saved items for logged-in user
router.get('/saved-items', authenticationToken, getSavedItems);

// Remove a saved item
router.delete('/saved-items/:item_id/:item_type', authenticationToken, removeSavedItem);

module.exports = router;
