const db = require('../DB/connect');
const { v4: uuidv4 } = require('uuid');

// Start or find a conversation
exports.startConversation = async (req, res) => {
    const { client_id, freelancer_id } = req.body;

    try {
        const [existing] = await db.query(
            `SELECT id FROM conversations 
             WHERE (participant_a = ? AND participant_b = ?) 
                OR (participant_a = ? AND participant_b = ?)`,
            [client_id, freelancer_id, freelancer_id, client_id]
        );

        if (existing.length > 0) {
            return res.json({ conversation_id: existing[0].id });
        }

        const conversationId = uuidv4();
        await db.query(
            `INSERT INTO conversations (id, participant_a, participant_b, last_message_at)
             VALUES (?, ?, ?, NOW())`,
            [conversationId, client_id, freelancer_id]
        );

        res.json({ conversation_id: conversationId });
    } catch (error) {
        console.error("Error starting conversation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// List all conversations for a user
exports.listConversations = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT c.id, c.participant_a, c.participant_b, c.last_message_at
             FROM conversations c
             WHERE c.participant_a = ? OR c.participant_b = ?
             ORDER BY c.last_message_at DESC`,
            [user_id, user_id]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error listing conversations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
