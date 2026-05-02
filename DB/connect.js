require('dotenv').config();
const mysql = require('mysql2/promise');

async function connectDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log('[DB] Connected to Aiven MySQL');
        return connection;
        
    } catch (err) {
        console.error('[DB] Connection error:', err);
    }
}

module.exports = connectDB;
