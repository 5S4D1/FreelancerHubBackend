const db = require('../DB/connect');

// Get all project categories
exports.getProjectCategories = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM categories');
    res.json(rows);
};

// add a new project category
exports.addProjectCategory = async (req, res) => {
    const { name, slug, icon_url = null } = req.body;
    if (!name || !slug) {
        return res.status(400).json(
            {
                message: 'Name and slug are required.'
            }
        );
    }

    try {
        const [result] = await db.query(
            `INSERT INTO categories
            (name, slug, icon_url) VALUES (?, ?, ?)`,
            [name, slug, icon_url]
        );

        res.json({
            message: 'Project Categories add successfully.',
            id: result.insertId,
            name,
            slug,
            icon_url
        });
    } catch (err) {
        console.error('[ADD CATEGORIES]', err);
        res.status(500).json({ message: 'Server error' })
    }
};
