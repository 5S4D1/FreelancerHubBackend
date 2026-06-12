const express = require('express');
const router = express.Router();
const { getProjectCategories, addProjectCategory } = require('../controllers/projectCategories');
const authenticationToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.get('/categories', getProjectCategories);
router.post('/categories', authenticationToken, authorizeRoles('admin'), addProjectCategory);

module.exports = router;
