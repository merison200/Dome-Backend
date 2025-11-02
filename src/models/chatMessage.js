import mongoose from 'mongoose';
import { createNotification } from "../utils/userNotification.js";

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['customer', 'admin', 'staff'],
      required: true,
    },
    message: {
      type: String,
      required: function() {
        // Only require message for text and system types
        return this.messageType === 'text' || this.messageType === 'system';
      },
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    // Image-specific fields (only used when messageType is 'image')
    imageUrl: {
      type: String,
      required: function() {
        return this.messageType === 'image';
      },
    },
    imagePublicId: {
      type: String, // Cloudinary public ID for image management
      required: function() {
        return this.messageType === 'image';
      },
    },
    imageDimensions: {
      width: Number,
      height: Number,
    },
    imageSize: Number, // Size in bytes
    readBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      readAt: {
        type: Date,
        default: Date.now,
      }
    }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    metadata: {
      fileName: String,
      fileSize: Number,
      fileType: String,
      originalName: String,
    },
    editHistory: [{
      editedAt: {
        type: Date,
        default: Date.now,
      },
      previousMessage: String,
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, createdAt: -1 });
chatMessageSchema.index({ conversationId: 1, isDeleted: 1 });
chatMessageSchema.index({ messageType: 1 }); // For filtering by message type

// Virtual for checking if message is read by specific user
chatMessageSchema.virtual('isReadBy').get(function() {
  return (userId) => {
    return this.readBy.some(read => read.userId.toString() === userId.toString());
  };
});

// Virtual for getting read status info
chatMessageSchema.virtual('readInfo').get(function() {
  return {
    totalReads: this.readBy.length,
    readByUsers: this.readBy.map(read => ({
      userId: read.userId,
      readAt: read.readAt
    }))
  };
});

// Virtual to easily identify image messages and get image data
chatMessageSchema.virtual('imageData').get(function() {
  if (this.messageType === 'image') {
    return {
      url: this.imageUrl,
      publicId: this.imagePublicId,
      dimensions: this.imageDimensions,
      size: this.imageSize
    };
  }
  return null;
});

// Method to mark as read by user
chatMessageSchema.methods.markAsReadBy = function(userId) {
  const existingRead = this.readBy.find(read => 
    read.userId.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      userId: userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Enhanced soft delete method to handle image messages properly
chatMessageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  
  if (this.messageType === 'image') {
    this.message = 'This image has been deleted';
  } else {
    this.message = 'This message has been deleted';
  }
  
  return this.save();
};

// Static method to create an image message
chatMessageSchema.statics.createImageMessage = async function(
  conversationId,
  senderId,
  senderRole,
  imageUrl,
  imagePublicId,
  imageDimensions = null,
  imageSize = null
) {
  const imageMessage = new this({
    conversationId,
    senderId,
    senderRole,
    messageType: 'image',
    imageUrl,
    imagePublicId,
    imageDimensions,
    imageSize,
    message: '[IMAGE]', // Default message for image preview
    readBy: [{ userId: senderId, readAt: new Date() }] // Mark as read by sender
  });

  return await imageMessage.save();
};

// Static method to get conversation history
chatMessageSchema.statics.getConversationHistory = async function(
  conversationId, 
  page = 1, 
  limit = 50,
  includeDeleted = false
) {
  const skip = (page - 1) * limit;
  
  const query = { 
    conversationId,
    ...(includeDeleted ? {} : { isDeleted: false })
  };
  
  const messages = await this.find(query)
    .populate('senderId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
    
  const totalCount = await this.countDocuments(query);
  
  return {
    messages: messages.reverse(), // Reverse to show oldest first
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
    hasMore: skip + messages.length < totalCount
  };
};

// Static method to mark all messages in conversation as read by user
chatMessageSchema.statics.markConversationAsReadBy = async function(
  conversationId, 
  userId
) {
  return await this.updateMany(
    { 
      conversationId,
      isDeleted: false,
      'readBy.userId': { $ne: userId }
    },
    { 
      $push: { 
        readBy: { 
          userId: userId, 
          readAt: new Date() 
        } 
      } 
    }
  );
};

// Static method to get unread message count for user in conversation
chatMessageSchema.statics.getUnreadCount = async function(conversationId, userId) {
  return await this.countDocuments({
    conversationId,
    isDeleted: false,
    'readBy.userId': { $ne: userId },
    senderId: { $ne: userId } // Don't count own messages as unread
  });
};

// FIXED: Clear conversation method - handle image messages properly without aggregation syntax
chatMessageSchema.statics.clearConversation = async function(conversationId) {
  try {
    // First, get all messages to update them individually
    const messages = await this.find({ conversationId });
    
    // Update each message individually
    const updatePromises = messages.map(async (message) => {
      const deletedMessage = message.messageType === 'image' 
        ? 'This image has been deleted'
        : 'This message has been deleted';
      
      return await this.findByIdAndUpdate(
        message._id,
        {
          isDeleted: true,
          message: deletedMessage
        },
        { new: true }
      );
    });
    
    const results = await Promise.all(updatePromises);
    console.log(`Cleared ${results.length} messages from conversation ${conversationId}`);
    
    return {
      modifiedCount: results.length,
      acknowledged: true
    };
  } catch (error) {
    console.error('Error in clearConversation:', error);
    throw error;
  }
};

// Pre-save middleware to generate conversationId if not provided
chatMessageSchema.pre('save', function(next) {
  if (!this.conversationId && this.senderId) {
    const adminId = 'admin';
    const userId = this.senderId.toString();
    
    if (this.senderRole === 'admin' || this.senderRole === 'staff') {
      this.conversationId = `admin_${userId}`;
    } else {
      this.conversationId = `${userId}_admin`;
    }
  }
  next();
});


// Create notification when admin sends message to user
chatMessageSchema.post('save', async function(doc) {
  try {
    // Only create notification for admin-to-user messages
    if (
      (doc.senderRole === 'admin' || doc.senderRole === 'staff') &&
      !doc.isDeleted &&
      doc.messageType !== 'system'
    ) {
      // Extract user ID from conversationId (format: "user_id_admin")
      const conversationParts = doc.conversationId.split('_');
      let userId = null;
      
      // Handle both "user_id_admin" and "userId_admin" formats
      if (conversationParts.includes('admin')) {
        userId = conversationParts.find(part => part !== 'admin' && mongoose.Types.ObjectId.isValid(part));
      }
      
      if (userId) {
        // Get sender info
        const sender = await mongoose.model('User').findById(doc.senderId).select('name');
        const senderName = sender ? sender.name : 'Admin';
        
        // Create message preview
        const messagePreview = doc.messageType === 'image' 
          ? 'Sent you an image' 
          : (doc.message.length > 50 ? doc.message.substring(0, 50) + '...' : doc.message);
        
        // Create notification
        await createNotification(
          userId,
          // `New Message from ${senderName}`,
          `New Message from Admin`,
          messagePreview,
          'info',
          { relatedChat: doc.conversationId }
        );
        
        console.log(`Chat notification created for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Failed to create chat notification:', error);
  }
});



const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;