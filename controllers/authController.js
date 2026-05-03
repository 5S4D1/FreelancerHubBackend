const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../DB/connect');

const secret = process.env.JWT_SECRET;

// REGISTER
exports.register = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword]);

        res.status(201).json({
            message: 'User registered successfully!!'
        });
    } catch (err) {
        console.error('[REGISTER] ', err);
        res.status(500).json({
            message: 'Server error!'
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({
                message: 'Invalid email'
            })
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' })
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            }, 
            secret, 
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error('[LOGIN] ', err);
        res.status(500).json({
            message: 'Server error!'
        })
    }
}