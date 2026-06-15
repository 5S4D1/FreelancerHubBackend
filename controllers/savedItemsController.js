const db = require('../DB/connect');

// Save an item (project or task)
exports.saveItem = async (req, res) => {
    const { item_id, item_type } = req.body;
    const user_id = req.user.id; // from auth middleware

    if (!item_id || !item_type) {
        return res.status(400).json({ message: 'item_id and item_type are required' });
    }

    try {
        await db.query(
            `INSERT INTO saved_items (user_id, item_id, item_type) VALUES (?, ?, ?)`,
            [user_id, item_id, item_type]
        );

        res.status(201).json({ message: 'Item saved successfully', item_id, item_type });
    } catch (err) {
        console.error('[SAVE ITEM]', err);
        res.status(500).json({ error: 'Failed to save item', details: err.message });
    }
};

// Get all saved items for a user
exports.getSavedItems = async (req, res) => {
    const user_id = req.user.id;

    try {
        const [rows] = await db.query(
            `SELECT * FROM saved_items WHERE user_id = ? ORDER BY created_at DESC`,
            [user_id]
        );

        res.json(rows);
    } catch (err) {
        console.error('[GET SAVED ITEMS]', err);
        res.status(500).json({ error: 'Failed to fetch saved items', details: err.message });
    }
};

// Remove a saved item
exports.removeSavedItem = async (req, res) => {
    const user_id = req.user.id;
    const { item_id, item_type } = req.params;

    try {
        await db.query(
            `DELETE FROM saved_items WHERE user_id = ? AND item_id = ? AND item_type = ?`,
            [user_id, item_id, item_type]
        );

        res.json({ message: 'Item removed successfully', item_id, item_type });
    } catch (err) {
        console.error('[REMOVE SAVED ITEM]', err);
        res.status(500).json({ error: 'Failed to remove saved item', details: err.message });
    }
};
