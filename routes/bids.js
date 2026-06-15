const express = require('express');
const router = express.Router();
const { placeBid, getBidsByProject, getFreelancerBids } = require('../controllers/bidsController');
const authenticationToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Place a bid on a project
router.post('/bids/:projectId/bids', authenticationToken, placeBid);

// Get all bids for a project (client/admin)
router.get('/bids/:projectId/bids', authenticationToken, authorizeRoles('client', 'admin'), getBidsByProject);

// Get all bids placed by a freelancer (freelancer/admin)
router.get('/bids/freelancer/:freelancerId', authenticationToken, authorizeRoles('freelancer', 'admin'), getFreelancerBids);

module.exports = router;
