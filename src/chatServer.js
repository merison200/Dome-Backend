import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/user.js';
import ChatMessage from './models/chatMessage.js';
import { uploadImage } from './utils/cloudinaryUtils.js';

// Store active connections
const activeUsers = new Map(); // userId -> { socketId, role, conversationId }
const activeConversations = new Map(); // conversationId -> Set of socketIds

export const initializeWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 10 * 1024 * 1024, // 10MB for image uploads
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email role');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user info to socket
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      socket.userEmail = user.email;
      
      console.log(`User ${user.name} (${user.role}) connected: ${socket.id}`);
      next();
    } catch (err) {
      console.error('Auth error:', err.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    // Store active user
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      role: socket.userRole,
      name: socket.userName,
      conversationId: null,
      lastSeen: new Date()
    });

    // Join user to their own room for direct messaging
    socket.join(socket.userId);

    // Handle joining a conversation
    socket.on('join-conversation', async (data) => {
      try {
        const { conversationId } = data;
        
        // Leave previous conversation if any
        if (socket.conversationId) {
          socket.leave(socket.conversationId);
          const prevConversation = activeConversations.get(socket.conversationId);
          if (prevConversation) {
            prevConversation.delete(socket.id);
            if (prevConversation.size === 0) {
              activeConversations.delete(socket.conversationId);
            }
          }
        }

        // Join new conversation
        socket.join(conversationId);
        socket.conversationId = conversationId;

        // Update active conversations
        if (!activeConversations.has(conversationId)) {
          activeConversations.set(conversationId, new Set());
        }
        activeConversations.get(conversationId).add(socket.id);

        // Update user's active conversation
        const userData = activeUsers.get(socket.userId);
        if (userData) {
          userData.conversationId = conversationId;
          activeUsers.set(socket.userId, userData);
        }

        // Mark all messages in conversation as read by this user
        await ChatMessage.markConversationAsReadBy(conversationId, socket.userId);

        // Notify others in conversation that user joined
        socket.to(conversationId).emit('user-joined', {
          userId: socket.userId,
          userName: socket.userName,
          userRole: socket.userRole,
          timestamp: new Date()
        });

        // Send confirmation to the user
        socket.emit('conversation-joined', {
          conversationId,
          timestamp: new Date(),
          activeUsers: Array.from(activeConversations.get(conversationId) || [])
            .map(socketId => {
              const user = Array.from(activeUsers.values())
                .find(user => user.socketId === socketId);
              return user ? { 
                userId: Array.from(activeUsers.keys()).find(key => activeUsers.get(key).socketId === socketId),
                name: user.name, 
                role: user.role 
              } : null;
            })
            .filter(Boolean)
        });

        console.log(`User ${socket.userName} joined conversation: ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle sending text messages
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, message, messageType = 'text', metadata = null } = data;

        if (!conversationId || !message?.trim()) {
          return socket.emit('error', { message: 'Missing conversation ID or message' });
        }

        // Create new message
        const newMessage = new ChatMessage({
          conversationId,
          senderId: socket.userId,
          senderRole: socket.userRole,
          message: message.trim(),
          messageType,
          metadata,
          readBy: [{ userId: socket.userId, readAt: new Date() }]
        });

        await newMessage.save();
        await newMessage.populate('senderId', 'name email role');

        // Create message data with proper structure
        const messageData = {
          _id: newMessage._id,
          conversationId: newMessage.conversationId,
          senderId: {
            _id: newMessage.senderId._id,
            name: newMessage.senderId.name,
            role: newMessage.senderId.role
          },
          senderRole: newMessage.senderRole,
          message: newMessage.message,
          messageType: newMessage.messageType,
          metadata: newMessage.metadata,
          readBy: newMessage.readBy,
          isEdited: newMessage.isEdited,
          isDeleted: newMessage.isDeleted,
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt
        };

        // Broadcast message to all users in the conversation
        io.to(conversationId).emit('message-received', messageData);

        // Send notifications to offline users
        await sendOfflineNotifications(conversationId, socket, message);

        console.log(`Message sent in ${conversationId} by ${socket.userName}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message', details: error.message });
      }
    });

    // FIXED: Handle sending image messages with proper error handling and connection management
    socket.on('send-image-message', async (data) => {
      let uploadResult = null;
      
      try {
        const { conversationId, imageData, fileName, fileSize, fileType } = data;

        if (!conversationId || !imageData) {
          return socket.emit('error', { message: 'Missing conversation ID or image data' });
        }

        console.log(`Processing image upload: ${fileName} (${fileSize} bytes)`);

        // Validate image data format
        if (!imageData.startsWith('data:image/')) {
          throw new Error('Invalid image data format');
        }

        // Extract base64 data and create buffer
        const base64Data = imageData.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 image data');
        }

        // Create a temporary file-like object for the upload function
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const tempFile = {
          buffer: imageBuffer,
          originalname: fileName || 'image.jpg',
          mimetype: fileType || 'image/jpeg',
          size: fileSize || imageBuffer.length
        };

        console.log(`Uploading to Cloudinary: ${tempFile.originalname}`);
        
        // Upload image to Cloudinary with proper error handling
        uploadResult = await uploadImage(tempFile, `chat_images/${conversationId}`);

        if (!uploadResult || !uploadResult.success) {
          throw new Error(uploadResult?.error || 'Failed to upload image to Cloudinary');
        }

        console.log(`Image uploaded successfully: ${uploadResult.url}`);

        // Create image message using the static method
        const imageMessage = await ChatMessage.createImageMessage(
          conversationId,
          socket.userId,
          socket.userRole,
          uploadResult.url,
          uploadResult.publicId,
          {
            width: uploadResult.width || 0,
            height: uploadResult.height || 0
          },
          uploadResult.bytes || tempFile.size
        );

        // Populate sender information
        await imageMessage.populate('senderId', 'name email role');

        // Create properly structured message data
        const messageData = {
          _id: imageMessage._id,
          conversationId: imageMessage.conversationId,
          senderId: {
            _id: imageMessage.senderId._id,
            name: imageMessage.senderId.name,
            role: imageMessage.senderId.role
          },
          senderRole: imageMessage.senderRole,
          message: imageMessage.message,
          messageType: imageMessage.messageType,
          imageUrl: imageMessage.imageUrl,
          imagePublicId: imageMessage.imagePublicId,
          imageDimensions: imageMessage.imageDimensions,
          imageSize: imageMessage.imageSize,
          readBy: imageMessage.readBy,
          isEdited: imageMessage.isEdited,
          isDeleted: imageMessage.isDeleted,
          createdAt: imageMessage.createdAt,
          updatedAt: imageMessage.updatedAt,
          // Add imageData for easy frontend access
          imageData: {
            url: imageMessage.imageUrl,
            publicId: imageMessage.imagePublicId,
            dimensions: imageMessage.imageDimensions,
            size: imageMessage.imageSize
          }
        };

        // Broadcast image message to all users in the conversation
        io.to(conversationId).emit('image-message-received', messageData);

        // Send notifications to offline users
        await sendOfflineNotifications(conversationId, socket, 'Shared an image');

        console.log(`Image message sent successfully in ${conversationId} by ${socket.userName}`);
        
        // Send confirmation to sender
        socket.emit('image-message-sent', { 
          success: true, 
          message: messageData,
          uploadInfo: {
            url: uploadResult.url,
            size: uploadResult.bytes
          }
        });

      } catch (error) {
        console.error('Error sending image message:', error);
        
        // If upload succeeded but message creation failed, try to clean up
        if (uploadResult && uploadResult.success && uploadResult.publicId) {
          try {
            const { deleteImage } = await import('./utils/cloudinaryUtils.js');
            await deleteImage(uploadResult.publicId);
            console.log('Cleaned up orphaned image after error');
          } catch (cleanupError) {
            console.error('Failed to cleanup orphaned image:', cleanupError);
          }
        }

        socket.emit('error', { 
          message: 'Failed to send image message',
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      try {
        const { conversationId, isTyping } = data;
        
        if (conversationId) {
          socket.to(conversationId).emit('user-typing', {
            userId: socket.userId,
            userName: socket.userName,
            isTyping,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    // Handle message read status
    socket.on('mark-as-read', async (data) => {
      try {
        const { messageId, conversationId } = data;

        if (messageId) {
          // Mark specific message as read
          const message = await ChatMessage.findById(messageId);
          if (message) {
            await message.markAsReadBy(socket.userId);
            socket.to(conversationId).emit('message-read', {
              messageId,
              readBy: socket.userId,
              timestamp: new Date()
            });
          }
        } else if (conversationId) {
          // Mark all messages in conversation as read
          await ChatMessage.markConversationAsReadBy(conversationId, socket.userId);
          socket.to(conversationId).emit('conversation-read', {
            userId: socket.userId,
            conversationId,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error marking as read:', error);
        socket.emit('error', { message: 'Failed to mark as read' });
      }
    });

    // Handle getting online users
    socket.on('get-online-users', () => {
      try {
        const onlineUsers = Array.from(activeUsers.entries()).map(([userId, userData]) => ({
          userId,
          name: userData.name,
          role: userData.role,
          lastSeen: userData.lastSeen,
          isInConversation: userData.conversationId !== null
        }));
        
        socket.emit('online-users', onlineUsers);
      } catch (error) {
        console.error('Error getting online users:', error);
        socket.emit('error', { message: 'Failed to get online users' });
      }
    });

    // Enhanced error handling for socket errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userName}:`, error);
      socket.emit('error', { 
        message: 'Socket connection error',
        details: error.message 
      });
    });

    // Handle disconnection with cleanup
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userName} disconnected: ${reason}`);
      
      try {
        // Remove from active users
        activeUsers.delete(socket.userId);

        // Remove from active conversations
        if (socket.conversationId) {
          const conversation = activeConversations.get(socket.conversationId);
          if (conversation) {
            conversation.delete(socket.id);
            if (conversation.size === 0) {
              activeConversations.delete(socket.conversationId);
            }
          }

          // Notify others in conversation that user left
          socket.to(socket.conversationId).emit('user-left', {
            userId: socket.userId,
            userName: socket.userName,
            userRole: socket.userRole,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error during disconnect cleanup:', error);
      }
    });
  });

  // Helper function to send offline notifications
  async function sendOfflineNotifications(conversationId, socket, message) {
    try {
      const conversationUsers = activeConversations.get(conversationId) || new Set();
      const allUsersInConversation = await getConversationParticipants(conversationId);
      
      for (const userId of allUsersInConversation) {
        const user = activeUsers.get(userId);
        if (!user || user.conversationId !== conversationId) {
          socket.to(userId).emit('new-message-notification', {
            conversationId,
            senderName: socket.userName,
            message: typeof message === 'string' ? message.substring(0, 100) : 'New message',
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error sending offline notifications:', error);
    }
  }

  // Helper function to get conversation participants
  async function getConversationParticipants(conversationId) {
    try {
      const parts = conversationId.split('_');
      const userIds = [];
      
      if (parts.includes('admin')) {
        const adminUsers = await User.find({ role: { $in: ['admin', 'staff'] } }).select('_id');
        userIds.push(...adminUsers.map(user => user._id.toString()));
        
        const customerId = parts.find(part => part !== 'admin');
        if (customerId && customerId !== 'admin') {
          userIds.push(customerId);
        }
      } else {
        userIds.push(...parts);
      }
      
      return [...new Set(userIds)];
    } catch (error) {
      console.error('Error getting conversation participants:', error);
      return [];
    }
  }

  console.log('WebSocket server initialized successfully with image support');
  return io;
};