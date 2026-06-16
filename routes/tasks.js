// routes/tasks.js
const express = require('express');
const router = express.Router();
const { createTask, getTasks } = require('../controllers/tasksController');
const authenticationToken = require('../middlewares/authMiddleware');

// Create a new task
router.post('/tasks', authenticationToken, createTask);

// Get all tasks
router.get('/tasks', authenticationToken, getTasks);

module.exports = router;
