const db = require('../config/db');

class MessageModel {
  // Send message
  static async sendMessage(messageData) {
    const sql = `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [
      messageData.sender_id,
      messageData.receiver_id,
      messageData.message
    ]);
    return result;
  }

  // Get conversation between two users
  static async getConversation(user1_id, user2_id) {
    const sql = `SELECT m.*, u.name as sender_name
                 FROM messages m
                 JOIN users u ON m.sender_id = u.id
                 WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
                 ORDER BY m.created_at ASC`;
    const [rows] = await db.execute(sql, [user1_id, user2_id, user2_id, user1_id]);
    return rows;
  }

  // Get all conversations for a user
  static async getUserConversations(user_id) {
    const sql = `SELECT DISTINCT 
                 CASE 
                   WHEN m.sender_id = ? THEN m.receiver_id
                   ELSE m.sender_id
                 END as other_user_id,
                 u.name as other_user_name,
                 u.user_type,
                 MAX(m.created_at) as last_message_time,
                 SUM(CASE WHEN m.receiver_id = ? AND m.is_read = FALSE THEN 1 ELSE 0 END) as unread_count
                 FROM messages m
                 JOIN users u ON (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END = u.id)
                 WHERE m.sender_id = ? OR m.receiver_id = ?
                 GROUP BY other_user_id, other_user_name, u.user_type
                 ORDER BY last_message_time DESC`;
    const [rows] = await db.execute(sql, [user_id, user_id, user_id, user_id, user_id]);
    return rows;
  }

  // Mark messages as read
  static async markAsRead(sender_id, receiver_id) {
    const sql = `UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?`;
    const [result] = await db.execute(sql, [sender_id, receiver_id]);
    return result;
  }
}

module.exports = MessageModel;
