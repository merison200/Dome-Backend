import mongoose from 'mongoose';
import ChatMessage from '../../models/chatMessage.js';
import User from '../../models/user.js';
import { uploadImage, deleteImage } from '../../utils/cloudinaryUtils.js';

// Get conversation history with pagination (ENHANCED for images)
export const getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, includeDeleted = false } = req.query;

    // Validate conversation access
    const isAuthorized = await validateConversationAccess(conversationId, req.user._id, req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const history = await ChatMessage.getConversationHistory(
      conversationId,
      parseInt(page),
      parseInt(limit),
      includeDeleted === 'true'
    );

    // Enhanced response with image data
    const enhancedMessages = history.messages.map(message => ({
      ...message,
      // Add image data for easy frontend access
      ...(message.messageType === 'image' && {
        imageData: {
          url: message.imageUrl,
          publicId: message.imagePublicId,
          dimensions: message.imageDimensions,
          size: message.imageSize
        }
      })
    }));

    res.json({
      success: true,
      data: {
        ...history,
        messages: enhancedMessages
      }
    });
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation history'
    });
  }
};

// Get all conversations for a user (FIXED - image support added correctly)
export const getUserConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    let matchQuery = {};

    if (userRole === 'admin' || userRole === 'staff') {
      matchQuery = {
        $or: [
          { senderRole: 'admin' },
          { senderRole: 'staff' },
          { conversationId: { $regex: '_admin$|^admin_' } }
        ]
      };
    } else {
      matchQuery = {
        $or: [
          { senderId: userId },
          { conversationId: { $regex: `^${userId}_|_${userId}$` } }
        ]
      };
    }

    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          ...matchQuery,
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$senderId', userId] },
                    { $not: { $in: [userId, '$readBy.userId'] } }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalMessages: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.senderId',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $project: {
          conversationId: '$_id',
          lastMessage: {
            _id: '$lastMessage._id',
            message: '$lastMessage.message',
            messageType: '$lastMessage.messageType',
            createdAt: '$lastMessage.createdAt',
            sender: {
              _id: '$sender._id',
              name: '$sender.name',
              role: '$sender.role'
            },
            // FIXED: Use $cond to conditionally include image data
            imageUrl: {
              $cond: {
                if: { $eq: ['$lastMessage.messageType', 'image'] },
                then: '$lastMessage.imageUrl',
                else: '$$REMOVE'
              }
            },
            imageDimensions: {
              $cond: {
                if: { $eq: ['$lastMessage.messageType', 'image'] },
                then: '$lastMessage.imageDimensions',
                else: '$$REMOVE'
              }
            }
          },
          unreadCount: 1,
          totalMessages: 1,
          participants: '$conversationId'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit)
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Process participants info for each conversation
    const processedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const participants = await getConversationParticipants(conv.conversationId);
        return {
          ...conv,
          participants
        };
      })
    );

    res.json({
      success: true,
      data: {
        conversations: processedConversations,
        currentPage: parseInt(page),
        totalPages: Math.ceil(processedConversations.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};



// Create or get existing conversation (UNCHANGED)
export const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user._id.toString();
    
    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    let conversationId;
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      conversationId = `admin_${participantId}`;
    } else if (participant.role === 'admin' || participant.role === 'staff') {
      conversationId = `${currentUserId}_admin`;
    } else {
      const sortedIds = [currentUserId, participantId].sort();
      conversationId = `${sortedIds[0]}_${sortedIds[1]}`;
    }

    const existingMessage = await ChatMessage.findOne({ conversationId });
    
    if (existingMessage) {
      const history = await ChatMessage.getConversationHistory(conversationId, 1, 20);
      return res.json({
        success: true,
        data: {
          conversationId,
          isNew: false,
          participant: {
            _id: participant._id,
            name: participant.name,
            role: participant.role
          },
          ...history
        }
      });
    }

    const systemMessage = new ChatMessage({
      conversationId,
      senderId: currentUserId,
      senderRole: req.user.role,
      message: `Conversation started between ${req.user.name} and ${participant.name}`,
      messageType: 'system'
    });

    await systemMessage.save();

    res.json({
      success: true,
      data: {
        conversationId,
        isNew: true,
        participant: {
          _id: participant._id,
          name: participant.name,
          role: participant.role
        },
        messages: [systemMessage],
        totalCount: 1,
        hasMore: false
      }
    });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create or get conversation'
    });
  }
};

// NEW: Upload image to conversation
export const uploadImageMessage = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const imageFile = req.file;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!conversationId || !imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and image file are required'
      });
    }

    const isAuthorized = await validateConversationAccess(conversationId, userId, userRole);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    const uploadResult = await uploadImage(imageFile, `chat_images/${conversationId}`);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary',
        error: uploadResult.error
      });
    }

    const imageMessage = await ChatMessage.createImageMessage(
      conversationId,
      userId,
      userRole,
      uploadResult.url,
      uploadResult.publicId,
      {
        width: uploadResult.width,
        height: uploadResult.height
      },
      uploadResult.bytes
    );

    await imageMessage.populate('senderId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageMessage
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// Mark conversation as read by current user (UNCHANGED)
export const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const isAuthorized = await validateConversationAccess(conversationId, userId, req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    await ChatMessage.markConversationAsReadBy(conversationId, userId);

    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read'
    });
  }
};

// Clear conversation (soft delete all messages) - ENHANCED for images
export const clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const isAuthorized = await validateConversationAccess(conversationId, userId, req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // First, get all image messages to delete from Cloudinary
    const imageMessages = await ChatMessage.find({
      conversationId,
      messageType: 'image',
      isDeleted: false
    });

    // Delete images from Cloudinary
    for (const message of imageMessages) {
      if (message.imagePublicId) {
        await deleteImage(message.imagePublicId);
      }
    }

    await ChatMessage.clearConversation(conversationId);

    res.json({
      success: true,
      message: 'Conversation cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation'
    });
  }
};

// Get unread message count for user (UNCHANGED)
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    let conversationQuery = {};
    
    if (userRole === 'admin' || userRole === 'staff') {
      conversationQuery = {
        conversationId: { $regex: '_admin$|^admin_' }
      };
    } else {
      conversationQuery = {
        conversationId: { $regex: `^${userId}_|_${userId}$` }
      };
    }

    const unreadCount = await ChatMessage.countDocuments({
      ...conversationQuery,
      isDeleted: false,
      'readBy.userId': { $ne: userId },
      senderId: { $ne: userId }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Delete a specific message (soft delete) - ENHANCED for images
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete image from Cloudinary if it's an image message
    if (message.messageType === 'image' && message.imagePublicId) {
      await deleteImage(message.imagePublicId);
    }

    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Helper function to validate conversation access (UNCHANGED)
// async function validateConversationAccess(conversationId, userId, userRole) {
//   if (userRole === 'admin' || userRole === 'staff') {
//     return true;
//   }

//   const userIdStr = userId.toString();
//   const isUserInConversation = conversationId.includes(userIdStr) || 
//                               conversationId.includes('admin');

//   return isUserInConversation;
// }

// Replace your entire validateConversationAccess function with this
async function validateConversationAccess(conversationId, userId, userRole) {
  if (userRole === 'admin' || userRole === 'staff') {
    return true;
  }

  const userIdStr = userId.toString();
  const isUserInConversation = conversationId.includes(userIdStr) || 
                              conversationId.includes('admin');

  return isUserInConversation;
};

// Helper function to get conversation participants (UNCHANGED)
// async function getConversationParticipants(conversationId) {
//   const parts = conversationId.split('_');
//   const participantIds = [];

//   if (parts.includes('admin')) {
//     const adminUsers = await User.find({ role: { $in: ['admin', 'staff'] } })
//       .select('_id name role')
//       .lean();
//     participantIds.push(...adminUsers);

//     const customerId = parts.find(part => part !== 'admin');
//     if (customerId && customerId !== 'admin') {
//       const customer = await User.findById(customerId).select('_id name role').lean();
//       if (customer) participantIds.push(customer);
//     }
//   } else {
//     const users = await User.find({ _id: { $in: parts } })
//       .select('_id name role')
//       .lean();
//     participantIds.push(...users);
//   }

//   return participantIds;
// }

// Helper to validate ObjectId
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to get conversation participants (FIXED)
async function getConversationParticipants(conversationId) {
  const participantIds = [];
  
  try {
    if (!conversationId || typeof conversationId !== 'string') {
      return participantIds;
    }

    // Split and filter out "user" prefix and empty strings
    const parts = conversationId.split('_').filter(part => part && part !== 'user');

    if (parts.includes('admin')) {
      const adminUsers = await User.find({ role: { $in: ['admin', 'staff'] } })
        .select('_id name role')
        .lean();
      participantIds.push(...adminUsers);

      const customerId = parts.find(part => part !== 'admin' && isValidObjectId(part));
      if (customerId) {
        const customer = await User.findById(customerId).select('_id name role').lean();
        if (customer) participantIds.push(customer);
      }
    } else {
      const validIds = parts.filter(isValidObjectId);
      if (validIds.length > 0) {
        const users = await User.find({ _id: { $in: validIds } })
          .select('_id name role')
          .lean();
        participantIds.push(...users);
      }
    }
  } catch (error) {
    console.error('Error in getConversationParticipants:', error);
  }

  return participantIds;
}

export default {
  getConversationHistory,
  getUserConversations,
  createOrGetConversation,
  uploadImageMessage,
  markConversationAsRead,
  clearConversation,
  getUnreadCount,
  deleteMessage
};