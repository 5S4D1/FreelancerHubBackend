const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject, acceptBid, rejectBid } = require('../controllers/projectsController');
const authenticationToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// public routes
router.get('/projects', getProjects);

// protected routes
router.post('/projects', authenticationToken, authorizeRoles('client'), createProject);

router.put('/projects/:id', authenticationToken, authorizeRoles('client'), updateProject);

router.delete('/projects/:id', authenticationToken, authorizeRoles('client'), deleteProject);

// Accept a bid for a project
router.put('/projects/:projectId/accept-bid/:bidId', authenticationToken, acceptBid);

// Reject a bid for a project
router.put('/projects/:projectId/reject-bid/:bidId', authenticationToken, authorizeRoles('client', 'admin'), rejectBid);

module.exports = router;