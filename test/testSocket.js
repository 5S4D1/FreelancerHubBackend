const { io } = require("socket.io-client");

// Replace with a real JWT from your login API
const token = "Bearer <your JWT here>";

const socket = io("http://localhost:3000", {
    auth: {
        token: token
    }
});

const conversationId = "40b1b82f-3ef8-4767-b424-8fb40dfbda93";

socket.on("connect", () => {
    console.log("Connected:", socket.id);

    // Join a conversation room
    socket.emit("joinConversation", conversationId);

    // Send a message (sender_id comes from JWT on backend)
    socket.emit("sendMessage", {
        conversation_id: conversationId,
        message_body: "Hello from boss"
    });
});

// Listen for new messages
socket.on("newMessage", (msg) => {
    console.log("New message received:", msg);
});

// Handle connection errors (e.g., invalid token)
socket.on("connect_error", (err) => {
    console.error("Connection failed:", err.message);
});
