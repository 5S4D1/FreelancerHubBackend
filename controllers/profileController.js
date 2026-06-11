const db = require('../DB/connect');

// Get user profile
exports.getProfile = async (req, res) => {
    const userId = req.user.id;
    const [rows] = await db.query(
        `SELECT 
            u.id,
            u.email,
            u.role,
            u.status,
            p.first_name,
            p.last_name,
            p.avatar_url,
            p.location,
            p.freelancer_type,
            p.english_level,
            p.hourly_rate,
            p.hours_per_week,
            p.response_time,
            p.about,
            p.avg_rating,
            p.total_reviews,
            p.happy_clients,
            p.projects_done,
            p.languages
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = ?
        LIMIT 1`, [userId]);
    res.json(rows[0]);
};

// Update user profile
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const {
        first_name,
        last_name,
        location,
        freelancer_type,
        english_level,
        hourly_rate,
        hours_per_week,
        response_time,
        about
    } = req.body;

    try {
        await db.query(
            `UPDATE profiles SET
                first_name = ?,
                last_name = ?,
                location = ?,
                freelancer_type = ?,
                english_level = ?,
                hourly_rate = ?,
                hours_per_week = ?,
                response_time = ?,
                about = ?
            WHERE user_id = ?`,
            [
                first_name,
                last_name,
                location,
                freelancer_type,
                english_level,
                hourly_rate,
                hours_per_week,
                response_time,
                about,
                userId
            ]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user id
exports.updateUser_id = async (req, res) => {
    const userId = req.user.id;
    const { new_user_id } = req.body;

    const [existing] = await db.query(`SELECT id FROM users WHERE id = ?`, [new_user_id]);
    if (existing.length > 0) {
        return res.status(400).json({ error: 'User ID already exists' });
    }

    // Start transaction to update user ID in both users and profiles tables
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(`UPDATE users SET id = ? WHERE id = ?`, [new_user_id, userId]);
        await connection.commit();
        console.log(`User ID updated from ${userId} to ${new_user_id}`);
        res.json({ message: 'User ID updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating user ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
};