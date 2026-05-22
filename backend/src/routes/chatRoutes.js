const express = require('express');
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getConversations,
  getConversationMessages,
  clearConversation,
  deleteConversation,
  renameConversation
} = require('../controllers/chatController');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.post('/message', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:conversationId', getConversationMessages);
router.patch('/conversation/clear', clearConversation);
router.patch('/conversation', renameConversation);
router.delete('/conversation', deleteConversation);

module.exports = router;