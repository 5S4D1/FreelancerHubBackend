const db = require('../DB/connect');
const { v4: uuidv4 } = require('uuid');

// Place a bid on a project
exports.placeBid = async (req, res) => {
  const { projectId } = req.params;
  const { proposal_text, client_hourly_rate, freelancer_hourly_rate } = req.body;

  try {
    const freelancer_id = req.user.id; // comes from auth middleware
    const bidId = uuidv4();

    const [result] = await db.query(
      `INSERT INTO bids (id, project_id, freelancer_id, proposal_text, client_hourly_rate, freelancer_hourly_rate, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [bidId, projectId, freelancer_id, proposal_text, client_hourly_rate || null, freelancer_hourly_rate || null]
    );

    console.log('Bid placed with ID:', bidId, 'by freelancer:', req.user.email, 'on project:', projectId);
    res.status(201).json({ message: 'Bid placed successfully', bidId: bidId });
  } catch (err) {
    console.error('[PLACE BID]', err);
    res.status(500).json({ error: 'Failed to place bid', details: err.message });
  }
};

// Get all bids for a project (client/admin)
exports.getBidsByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM bids WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    res.json(rows);
  } catch (err) {
    console.error('[GET BIDS BY PROJECT]', err);
    res.status(500).json({ error: 'Failed to fetch bids', details: err.message });
  }
};

// Get all bids placed by a freelancer
exports.getFreelancerBids = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM bids WHERE freelancer_id = ? ORDER BY created_at DESC',
      [freelancerId]
    );

    res.json(rows);
  } catch (err) {
    console.error('[GET FREELANCER BIDS]', err);
    res.status(500).json({ error: 'Failed to fetch freelancer bids', details: err.message });
  }
};
