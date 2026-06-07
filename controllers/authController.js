const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../DB/connect');
const cloudinary = require('../CDN/cloudinary');

const secret = process.env.JWT_SECRET;

const FALLBACK_AVATAR_URL = 'https://res.cloudinary.com/dz6mwsw9d/image/upload/v1778526754/fallback_img.png';


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
            { expiresIn: '2d' }
        );

        // Wallet summary (available, pending, withdrawn)
        const [walletRows] = await db.query(`
            SELECT balance_available, balance_pending, total_withdrawn
            FROM wallets
            WHERE user_id = ?`,
            [user.id]
        );
        const wallet = walletRows[0] || { balance_available: 0, balance_pending: 0, total_withdrawn: 0 };

        // Income + withdraw requests
        const [incomeRows] = await db.query(`
            SELECT 
            SUM(CASE WHEN type='income' AND status='completed' THEN amount ELSE 0 END) AS total_income,
            SUM(CASE WHEN type='withdrawal' AND status='pending' THEN amount ELSE 0 END) AS withdraw_request
            FROM transactions
            WHERE user_id = ?`,
            [user.id]
        );
        const income = incomeRows[0] || { total_income: 0, withdraw_request: 0 };

        // Project stats
        const [projectRows] = await db.query(`
            SELECT 
            SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed_projects,
            SUM(CASE WHEN status='ongoing' THEN 1 ELSE 0 END) AS ongoing_projects,
            SUM(CASE WHEN status='canceled' THEN 1 ELSE 0 END) AS canceled_projects
            FROM projects
            WHERE client_id = ? OR id IN (
            SELECT project_id FROM bids WHERE freelancer_id = ? AND status='accepted')`,
            [user.id, user.id]
        );
        const projects = projectRows[0] || { completed_projects: 0, ongoing_projects: 0, canceled_projects: 0 };

        // Task stats (⚠️ requires a task_orders table to track sales)
        const [taskRows] = await db.query(`
            SELECT 
            SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS tasks_sold,
            SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS ongoing_tasks,
            SUM(CASE WHEN status='paused' THEN 1 ELSE 0 END) AS canceled_tasks
            FROM tasks
            WHERE freelancer_id = ?`,
            [user.id]
        );
        const tasks = taskRows[0] || { tasks_sold: 0, ongoing_tasks: 0, canceled_tasks: 0 };

        // Payment methods (⚠️ requires payment_methods table)
        const paymentRows = [];

        // Earning history
        const [earningRows] = await db.query(`
            SELECT amount, type, status, created_at
            FROM transactions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 20`,
            [user.id]
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
                    avatar_url: user.avatar_url || FALLBACK_AVATAR_URL,
                    freelancer_type: user.freelancer_type
                },
                stats: {
                    total_income: income.total_income,
                    withdraw_request: income.withdraw_request,
                    pending_income: wallet.balance_pending,
                    available_in_account: wallet.balance_available,
                    completed_projects: projects.completed_projects,
                    ongoing_projects: projects.ongoing_projects,
                    canceled_projects: projects.canceled_projects,
                    tasks_sold: tasks.tasks_sold,
                    ongoing_tasks: tasks.ongoing_tasks,
                    canceled_tasks: tasks.canceled_tasks,
                    payment_methods: paymentRows,
                    earning_history: earningRows
                }
            }
        });

    } catch (err) {
        console.error('[LOGIN] ', err);
        res.status(500).json({ message: 'Server error' });
    }
};