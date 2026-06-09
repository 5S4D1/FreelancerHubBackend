const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectsController');
const authenticationToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// public routes
router.get('/projects', getProjects);

// protected routes
router.post('/projects',authenticationToken,authorizeRoles('client'), createProject);

router.put('/projects/:id',authenticationToken,authorizeRoles('client'), updateProject);

router.delete('/projects/:id',authenticationToken,authorizeRoles('client'), deleteProject);

module.exports = router;