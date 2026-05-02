require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3000;
const connectDB = require('./DB/connect')

let db;
(async () => {
    db = await connectDB();
})();

app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS test');
        console.log(rows);
        res.send('<h1>Hello, Geeks!</h1><p>This is your simple Express server.</p>');
    } catch (err) {
        res.status(500).send('Database query failed!');
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});