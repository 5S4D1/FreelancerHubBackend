const db = require('../DB/connect');
const { v4: uuidv4 } = require('uuid');

// Send a message via REST (optional, if you want non-socket fallback)
exports.sendMessage = async (req, res) => {
    const { conversation_id, sender_id, message_body } = req.body;

    try {
        const messageId = uuidv4();
        await db.query(
            `INSERT INTO messages (id, conversation_id, sender_id, message_body, is_read, sent_at)
             VALUES (?, ?, ?, ?, 0, NOW())`,
            [messageId, conversation_id, sender_id, message_body]
        );

        await db.query(
            `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
            [conversation_id]
        );

        res.json({ message: "Message sent", id: messageId });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all messages in a conversation
exports.getMessages = async (req, res) => {
    const { conversation_id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT m.id, m.sender_id, u.email, m.message_body, m.is_read, m.sent_at
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.conversation_id = ?
             ORDER BY m.sent_at ASC`,
            [conversation_id]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
