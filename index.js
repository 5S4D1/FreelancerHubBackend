require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const connectDB = require('./DB/connect')

app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/auth');
const avatarRoutes = require('./routes/avatar');

app.use('/api', avatarRoutes);
app.use('/api', authRoutes);

app.get('/', async (req, res) => {
    res.send('<h1>Welcome!</h1><p>FreelancerHub running..</p>');
});

app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});