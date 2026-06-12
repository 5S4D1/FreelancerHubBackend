const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected:", socket.id);

    socket.emit("joinConversation", "40b1b82f-3ef8-4767-b424-8fb40dfbda93");

    socket.emit("sendMessage", {
        conversation_id: "40b1b82f-3ef8-4767-b424-8fb40dfbda93",
        sender_id: "1234",
        message_body: "Hello from boss"
    });
});

socket.on("newMessage", (msg) => {
    console.log("New message received:", msg);
});
