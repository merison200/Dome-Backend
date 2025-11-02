import mongoose from 'mongoose';
import UserManagement from '../../models/userManagement.js';
import User from '../../models/user.js';
import sendEmail from '../../utils/sendEmail.js';
import { adminNotificationEmail, roleChangeNotificationEmail } from '../../templates/userManagement.js';

// GET /api/admin/users/analytics
export const getUserAnalytics = async (req, res) => {
  console.log('getUserAnalytics called');
  console.log('Path:', req.path);
  console.log('Original URL:', req.originalUrl);
  console.log('Params:', req.params);
  
  try {
    const analytics = await UserManagement.getUserAnalytics();
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    
    const filters = {
      search: req.query.search || '',
      role: req.query.role || 'all',
      status: req.query.status || 'all'
    };

    const result = await UserManagement.getUsersWithStats(page, limit, filters);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// GET /api/admin/users/:userId
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Use the static method directly - it handles everything
    const userDetails = await UserManagement.getUserDetails(userId);
    
    res.status(200).json({
      success: true,
      data: userDetails
    });
  } catch (error) {
    console.error('Get user details error:', error);
    
    // Handle specific error for user not found
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

// PATCH /api/admin/users/:userId/role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate new role
    const validRoles = ['admin', 'staff', 'customer'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be one of: admin, staff, customer'
      });
    }

    if (!newRole) {
      return res.status(400).json({
        success: false,
        message: 'New role is required'
      });
    }

    // Get user from main User model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    
    // Don't allow users to change their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Update user role in main User model
    user.role = newRole;
    await user.save();

    // Ensure user management record exists
    await UserManagement.findOrCreateManagement(userId);

    // Send notification email to user
    try {
      const emailHtml = roleChangeNotificationEmail(user.name, oldRole, newRole);
      await sendEmail({
        to: user.email,
        subject: 'Account Role Updated - The Dome',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Role change notification email failed:', emailError);
      // Continue even if email fails
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        oldRole
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// PATCH /api/admin/users/:userId/status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified. Must be one of: active, inactive'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow users to deactivate themselves
    if (status === 'inactive' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Find or create user management record
    let userManagement = await UserManagement.findOne({ userId });
    
    if (!userManagement) {
      userManagement = new UserManagement({ userId });
    }

    // Update status and set review info
    userManagement.status = status;
    userManagement.lastReviewed = new Date();
    userManagement.reviewedBy = req.user._id;
    
    await userManagement.save();

    res.status(200).json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: userManagement.status,
        lastReviewed: userManagement.lastReviewed
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// PATCH /api/admin/users/bulk-status
export const updateBulkUserStatus = async (req, res) => {
  try {
    const { userIds, status } = req.body;
    
    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified. Must be one of: active, inactive'
      });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required and cannot be empty'
      });
    }

    // Validate all user IDs
    const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid user IDs provided'
      });
    }

    // Don't allow users to deactivate themselves
    if (status === 'inactive' && validUserIds.includes(req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Process each user
    const results = [];
    const errors = [];

    for (const userId of validUserIds) {
      try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }

        // Find or create user management record
        let userManagement = await UserManagement.findOne({ userId });
        
        if (!userManagement) {
          userManagement = new UserManagement({ userId });
        }

        // Update status
        userManagement.status = status;
        userManagement.lastReviewed = new Date();
        userManagement.reviewedBy = req.user._id;
        
        await userManagement.save();
        
        results.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          status: userManagement.status
        });
      } catch (error) {
        errors.push({ userId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.length} users ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: {
        updatedCount: results.length,
        failedCount: errors.length,
        updatedUsers: results,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Update bulk user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// PATCH /api/admin/users/:userId/notes
export const updateUserNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminNotes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find or create user management record
    let userManagement = await UserManagement.findOne({ userId });
    
    if (!userManagement) {
      userManagement = new UserManagement({ userId });
    }

    // Update admin notes
    userManagement.adminNotes = adminNotes || '';
    userManagement.lastReviewed = new Date();
    userManagement.reviewedBy = req.user._id;
    
    await userManagement.save();

    res.status(200).json({
      success: true,
      message: 'User notes updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        adminNotes: userManagement.adminNotes,
        lastReviewed: userManagement.lastReviewed
      }
    });
  } catch (error) {
    console.error('Update user notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user notes',
      error: error.message
    });
  }
};

// POST /api/admin/users/:userId/send-email
export const sendUserEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, message } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Get user from main User model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create email HTML using your template
    const emailHtml = adminNotificationEmail(user.name, subject, message);
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: `${subject} - The Dome`,
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        recipient: user.email,
        subject,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Send user email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};