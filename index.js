require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./DB/connect');

const app = express();
const server = http.createServer(app);
const PORT = 3000;

const socketAuth = require('./middlewares/socketAuth');

// Attach socket.io
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.json());
app.use(cors());
io.use(socketAuth);

// Routes
const authRoutes = require('./routes/auth');
const avatarRoutes = require('./routes/avatar');
const projectsRoutes = require('./routes/projects');
const profileRoutes = require('./routes/profile');
const categoriesRoutes = require('./routes/categories');
const conversationsRoutes = require('./routes/conversations');
const messagesRoutes = require('./routes/messages');


app.use('/api', avatarRoutes);
app.use('/api', authRoutes);
app.use('/api', projectsRoutes);
app.use('/api', profileRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', conversationsRoutes);
app.use('/api', messagesRoutes);

app.get('/', async (req, res) => {
    res.send('<h1>Welcome!</h1><p>FreelancerHub running..</p>');
});

// --- Import and setup Socket.IO ---
const setupSocket = require('./services/socket');
setupSocket(io);

// Start server with http + socket.io
server.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});
