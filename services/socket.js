// services/socket.js
const { v4: uuidv4 } = require('uuid');
const db = require('../DB/connect');

function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('joinConversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`User joined conversation ${conversationId}`);
        });

        socket.on('sendMessage', async (data) => {
            const { conversation_id, sender_id, message_body } = data;
            const messageId = uuidv4();

            try {
                await db.query(
                    `INSERT INTO messages (id, conversation_id, sender_id, message_body, is_read, sent_at)
                     VALUES (?, ?, ?, ?, 0, NOW())`,
                    [messageId, conversation_id, socket.user.id, message_body]
                );

                await db.query(
                    `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
                    [conversation_id]
                );

                io.to(conversation_id).emit('newMessage', {
                    id: messageId,
                    conversation_id,
                    sender_id: socket.user.id,
                    message_body,
                    sent_at: new Date()
                });
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });
    });
}

module.exports = setupSocket;
