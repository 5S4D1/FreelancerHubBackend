const db = require('../DB/connect');

exports.all_users = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT 
                u.id AS user_id,
                p.first_name,
                p.last_name,
                p.avatar_url
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE u.role != 'admin'
            LIMIT 10`
        );
        res.status(200).json({ users });
    } catch (err) {
        console.error('[ALL_USERS] ', err);
        res.status(500).json({ message: 'Server error' });
    }
};
