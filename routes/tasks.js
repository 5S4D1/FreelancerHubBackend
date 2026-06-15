const express = require('express');
const router = express.Router();
const { addProjectToTask } = require('../controllers/tasksController');
const authenticationToken = require('../middlewares/authMiddleware');

// Link project to freelancer’s task
router.post('/tasks/:taskId/add-project', authenticationToken, addProjectToTask);

module.exports = router;
