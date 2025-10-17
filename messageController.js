const MessageModel = require('../models/messageModel');

class MessageController {
  // Send message
  static async sendMessage(req, res) {
    try {
      const result = await MessageModel.sendMessage(req.body);
      res.status(201).json({ message: 'Message sent successfully', messageId: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  // Get conversation
  static async getConversation(req, res) {
    try {
      const { user1_id, user2_id } = req.query;
      const messages = await MessageModel.getConversation(user1_id, user2_id);
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

  // Get user conversations
  static async getUserConversations(req, res) {
    try {
      const conversations = await MessageModel.getUserConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  // Mark as read
  static async markAsRead(req, res) {
    try {
      const { sender_id, receiver_id } = req.body;
      await MessageModel.markAsRead(sender_id, receiver_id);
      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
}

module.exports = MessageController;
