const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');

router.post('/', MessageController.sendMessage);
router.get('/conversation', MessageController.getConversation);
router.get('/user/:userId', MessageController.getUserConversations);
router.put('/read', MessageController.markAsRead);

module.exports = router;
