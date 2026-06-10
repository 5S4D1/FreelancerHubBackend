const db = require('../DB/connect');

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

        const [result] = await db.query(
            `INSERT INTO projects 
             (id, client_id, category_id, title, description, price_type, min_price, max_price, experience_level, job_type, status, hiring_capacity) 
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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

        res.status(201).json({
            message: 'Project created successfully',
            projectId: result.insertId
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
        res.json({ message: 'Project deleted successfully', projectId: id });
    } catch (err) {
        console.error('[DELETE PROJECT]', err);
        res.status(500).json({ message: 'Server error' });
    }
};
