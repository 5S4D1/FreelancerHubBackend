const db = require('../DB/connect');
const { v4: uuidv4 } = require('uuid');

// Get all projects
exports.getProjects = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM projects');
    res.json(rows);
};

// Create a new project
exports.createProject = async (req, res) => {
    const { title, description, status, category_id, price_type, min_price, max_price, experience_level, job_type, hiring_capacity } = req.body;

    if (!title || !description) {
        return res.status(400).json(
            {
                message: 'Title, description, and client_id are required'
            }
        );
    }

    try {
        const client_id = req.user.id;
        const projectId = uuidv4();

        const [result] = await db.query(
            `INSERT INTO projects 
             (id, client_id, category_id, title, description, price_type, min_price, max_price, experience_level, job_type, status, hiring_capacity) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                projectId,
                client_id,
                category_id || null,
                title,
                description,
                price_type || 'fixed',
                min_price || null,
                max_price || null,
                experience_level || 'entry',
                job_type || 'remote',
                status || 'open',
                hiring_capacity || 1
            ]
        );
        console.log('Project created with ID:', projectId, 'by user:', req.user.email);

        res.status(201).json({
            message: 'Project created successfully',
            projectId: projectId
        });
    } catch (err) {
        console.error('[CREATE PROJECT]', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, category_id, price_type, min_price, max_price, experience_level, job_type, hiring_capacity } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    try {
        const [projectRows] = await db.query('SELECT client_id FROM projects WHERE id = ?', [id]);
        if (projectRows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const project = projectRows[0];
        if (req.user.role !== 'admin' && project.client_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own projects' });
        }

        await db.query(
            `UPDATE projects 
             SET title = ?, description = ?, status = ?, category_id = ?, price_type = ?, min_price = ?, max_price = ?, experience_level = ?, job_type = ?, hiring_capacity = ? 
             WHERE id = ?`,
            [title, description, status, category_id, price_type, min_price, max_price, experience_level, job_type, hiring_capacity, id]
        );

        res.json({
            message: 'Project updated successfully',
            projectId: id
        });
    } catch (err) {
        console.error('[UPDATE PROJECT]', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const [projectRows] = await db.query('SELECT client_id FROM projects WHERE id = ?', [id]);
        if (projectRows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const project = projectRows[0];
        if (req.user.role !== 'admin' && project.client_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own projects' });
        }

        await db.query('DELETE FROM projects WHERE id = ?', [id]);
        console.log(`Project deleted with ID: ${id}`);

        res.json({
            message: 'Project deleted successfully', projectId: id 
        });
    } catch (err) {
        console.error('[DELETE PROJECT]', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Accept a bid for a project
exports.acceptBid = async (req, res) => {
    const { projectId, bidId } = req.params;

    try {
        // Ensure project exists and belongs to client/admin
        const [projectRows] = await db.query('SELECT client_id, hiring_capacity FROM projects WHERE id = ?', [projectId]);

        if (!projectRows.length) return res.status(404).json({ message: 'Project not found' });

        const project = projectRows[0];
        if (req.user.role !== 'admin' && project.client_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only accept bids on your own projects' });
        }

        if (project.hiring_capacity <= 0) {
            return res.status(400).json({ message: 'Hiring capacity reached, cannot accept more bids' });
        }

        // Get freelancer_id from bid
        const [bid] = await db.query('SELECT freelancer_id FROM bids WHERE id = ?', [bidId]);
        if (!bid.length) return res.status(404).json({ error: 'Bid not found' });

        const freelancerId = bid[0].freelancer_id;

        // Update bid status
        await db.query('UPDATE bids SET status = ? WHERE id = ?', ['accepted', bidId]);

        // Update project status and reduce hiring capacity
        await db.query(
            'UPDATE projects SET status = ?, hiring_capacity = hiring_capacity - 1 WHERE id = ?',
            ['ongoing', projectId]
        );

        console.log(`Bid ${bidId} accepted for Project ${projectId}, Freelancer ${freelancerId} assigned`);
        res.json({
            message: 'Bid accepted, project assigned', freelancerId 
        });
    } catch (err) {
        console.error('[ACCEPT BID]', err);
        res.status(500).json({ 
            error: 'Failed to accept bid', details: err.message 
        });
    }
};

// Reject a bid for a project
exports.rejectBid = async (req, res) => {
    const { projectId, bidId } = req.params;

    try {
        // Ensure project exists and belongs to client/admin
        const [projectRows] = await db.query('SELECT client_id FROM projects WHERE id = ?', [projectId]);
        if (!projectRows.length) return res.status(404).json({ message: 'Project not found' });

        const project = projectRows[0];
        if (req.user.role !== 'admin' && project.client_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only reject bids on your own projects' });
        }

        // Ensure bid exists
        const [bid] = await db.query('SELECT id FROM bids WHERE id = ? AND project_id = ?', [bidId, projectId]);
        if (!bid.length) return res.status(404).json({ error: 'Bid not found' });

        // Update bid status to rejected
        await db.query('UPDATE bids SET status = ? WHERE id = ?', ['rejected', bidId]);

        res.json({ message: 'Bid rejected successfully', bidId });
    } catch (err) {
        console.error('[REJECT BID]', err);
        res.status(500).json({ error: 'Failed to reject bid', details: err.message });
    }
};
