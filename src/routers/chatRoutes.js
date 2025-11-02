import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
  getConversationHistory,
  getUserConversations,
  createOrGetConversation,
  uploadImageMessage,
  markConversationAsRead,
  clearConversation,
  getUnreadCount,
  deleteMessage
} from '../controllers/dashboard/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// GET /api/chat/conversations - Get all conversations for current user
router.get('/conversations', getUserConversations);

// POST /api/chat/conversations - Create or get existing conversation
router.post('/conversations', createOrGetConversation);

// GET /api/chat/conversation/:conversationId - Get conversation history
router.get('/conversation/:conversationId', getConversationHistory);

// NEW: POST /api/chat/upload-image - Upload image to conversation
router.post('/upload-image', upload.single('image'), uploadImageMessage);

// PUT /api/chat/conversation/:conversationId/read - Mark conversation as read
router.put('/conversation/:conversationId/read', markConversationAsRead);

// DELETE /api/chat/conversation/:conversationId/clear - Clear conversation (soft delete all messages)
router.delete('/conversation/:conversationId/clear', clearConversation);

// GET /api/chat/unread-count - Get total unread message count for user
router.get('/unread-count', getUnreadCount);

// DELETE /api/chat/message/:messageId - Delete a specific message
router.delete('/message/:messageId', deleteMessage);

export default router;