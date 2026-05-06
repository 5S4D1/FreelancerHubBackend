const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../DB/connect');

const secret = process.env.JWT_SECRET;

// REGISTER
exports.register = async (req, res) => {
    const {
        first_name,
        last_name,
        email,
        role = 'freelancer',
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // check existing email
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = randomUUID();

        await db.query(
            'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [userId, email, hashedPassword, role]
        );

        // create minimal profile row; other fields use DB defaults
        const profileId = randomUUID();
        await db.query(
            'INSERT INTO profiles (id, user_id, first_name, last_name) VALUES (?, ?, ?, ?)',
            [profileId, userId, first_name || null, last_name || null]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: userId,
                email,
                role
            }
        });
    } catch (err) {
        console.error('[REGISTER] ', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [rows] = await db.query(
            `SELECT 
                u.id,
                u.email,
                u.password_hash,
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
             WHERE u.email = ?
             LIMIT 1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: '2h' }
        );

        res.json({
            token,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
                profile: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    avatar_url: user.avatar_url,
                    location: user.location,
                    freelancer_type: user.freelancer_type,
                    english_level: user.english_level,
                    hourly_rate: user.hourly_rate,
                    hours_per_week: user.hours_per_week,
                    response_time: user.response_time,
                    about: user.about,
                    avg_rating: user.avg_rating,
                    total_reviews: user.total_reviews,
                    happy_clients: user.happy_clients,
                    projects_done: user.projects_done,
                    languages: user.languages
                }
            }
        });
    } catch (err) {
        console.error('[LOGIN] ', err);
        res.status(500).json({ message: 'Server error' });
    }
};