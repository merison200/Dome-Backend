import mongoose from "mongoose";
import User from './user.js';

const userManagementSchema = new mongoose.Schema(
  {
    // Reference to main user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Admin-specific fields
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    adminNotes: {
      type: String,
      default: ''
    },
    lastReviewed: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for admin queries
userManagementSchema.index({ status: 1 });
userManagementSchema.index({ lastReviewed: -1 });


/**
 * Get comprehensive user analytics for admin dashboard
 */
userManagementSchema.statics.getUserAnalytics = async function() {
  try {
    const now = new Date();
    const last6MonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    // Get total users from main User model
    const totalUsers = await User.countDocuments();
    
    // Count active/inactive from UserManagement (with fallback)
    let activeUsers = await this.countDocuments({ status: 'active' });
    let inactiveUsers = await this.countDocuments({ status: 'inactive' });
    
    // If no UserManagement records exist, assume all users are active
    const totalUserManagementRecords = await this.countDocuments();
    if (totalUserManagementRecords === 0) {
      activeUsers = totalUsers;
      inactiveUsers = 0;
    }

    // Role distribution from User model
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$count', totalUsers || 1] }, 100] }, 1]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly registrations from User model
    const newRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last6MonthsStart }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          month: {
            $let: {
              vars: {
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              },
              in: {
                $arrayElemAt: ['$$months', { $subtract: ['$_id.month', 1] }]
              }
            }
          },
          count: 1
        }
      }
    ]);

    // Get booking analytics (top customers and revenue)
    let topCustomers = [];
    let averageRevenue = 0;

    try {
      const Booking = mongoose.model('Booking');
      const bookingCount = await Booking.countDocuments();
      
      if (bookingCount > 0) {
        // Get top customers with revenue
        topCustomers = await Booking.aggregate([
          {
            $match: { 
              status: { $in: ['confirmed', 'completed'] },
              paymentStatus: 'paid',
              totalAmount: { $exists: true, $gt: 0 }
            }
          },
          {
            $group: {
              _id: '$userId',
              bookings: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          },
          {
            $match: { revenue: { $gt: 0 } }
          },
          {
            $sort: { revenue: -1 }
          },
          {
            $limit: 5
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $project: {
              name: '$user.name',
              email: '$user.email',
              bookings: 1,
              revenue: 1
            }
          }
        ]);

        // Calculate average revenue per customer
        const revenueStats = await Booking.aggregate([
          { 
            $match: { 
              status: { $in: ['confirmed', 'completed'] },
              paymentStatus: 'paid',
              totalAmount: { $exists: true, $gt: 0 }
            } 
          },
          {
            $group: {
              _id: '$userId',
              revenue: { $sum: '$totalAmount' }
            }
          },
          {
            $match: { revenue: { $gt: 0 } }
          },
          {
            $group: {
              _id: null,
              averageRevenue: { $avg: '$revenue' },
              totalRevenue: { $sum: '$revenue' },
              customerCount: { $sum: 1 }
            }
          }
        ]);

        if (revenueStats.length > 0) {
          averageRevenue = revenueStats[0].averageRevenue || 0;
        }
      }
    } catch (error) {
      console.warn('Booking data not available for analytics:', error.message);
    }

    return {
      totalStats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        averageRevenue: Math.round(averageRevenue)
      },
      newRegistrations,
      roleDistribution,
      topCustomers
    };
  } catch (error) {
    console.error('Analytics calculation error:', error);
    throw new Error(`Analytics calculation failed: ${error.message}`);
  }
};


/**
 * Get users with stats - NO SYNC REQUIRED
 * Starts from User model and joins UserManagement data
 */
userManagementSchema.statics.getUsersWithStats = async function(page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;

    // Build aggregation pipeline starting from User model
    const pipeline = [
      // Lookup UserManagement data (optional - uses defaults if not exists)
      {
        $lookup: {
          from: 'usermanagements',
          localField: '_id',
          foreignField: 'userId',
          as: 'management'
        }
      },
      // Add management fields with defaults
      {
        $addFields: {
          managementData: {
            $cond: {
              if: { $gt: [{ $size: '$management' }, 0] },
              then: { $arrayElemAt: ['$management', 0] },
              else: {
                status: 'active',
                adminNotes: '',
                lastReviewed: null
              }
            }
          }
        }
      },
      // Project final fields - FIXED: removed password exclusion from inclusion projection
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          status: '$managementData.status',
          adminNotes: '$managementData.adminNotes',
          lastReviewed: '$managementData.lastReviewed'
          // Removed: password: 0 (can't mix inclusion and exclusion)
        }
      }
    ];

    // Add search filter
    if (filters.search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } }
          ]
        }
      });
    }

    // Add role filter
    if (filters.role && filters.role !== 'all') {
      pipeline.push({
        $match: { role: filters.role }
      });
    }

    // Add status filter
    if (filters.status && filters.status !== 'all') {
      pipeline.push({
        $match: { status: filters.status }
      });
    }

    // Get total count BEFORE pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const countResult = await User.aggregate(countPipeline);
    const totalUsers = countResult[0]?.total || 0;

    // Add sorting and pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Execute aggregation on User model
    const users = await User.aggregate(pipeline);

    // Get booking stats for these users
    let usersWithStats = users;
    
    try {
      const Booking = mongoose.model('Booking');
      const userIds = users.map(u => u._id);
      
      const userStats = await Booking.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            status: { $in: ['confirmed', 'completed'] },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: '$userId',
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            lastBooking: { $max: '$createdAt' }
          }
        }
      ]);

      const statsMap = new Map();
      userStats.forEach(stat => {
        statsMap.set(stat._id.toString(), stat);
      });

      usersWithStats = users.map(user => {
        const stats = statsMap.get(user._id.toString());
        return {
          ...user,
          totalBookings: stats?.totalBookings || 0,
          totalRevenue: stats?.totalRevenue || 0,
          lastBooking: stats?.lastBooking || null
        };
      });
    } catch (error) {
      console.warn('Booking model not available for user stats:', error.message);
      usersWithStats = users.map(user => ({
        ...user,
        totalBookings: 0,
        totalRevenue: 0,
        lastBooking: null
      }));
    }

    return {
      users: usersWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1,
        limit
      }
    };
  } catch (error) {
    console.error('Get users with stats error:', error);
    throw new Error(`Failed to fetch users with stats: ${error.message}`);
  }
};


/**
 * Get detailed user info with bookings - NO SYNC REQUIRED
 * Works directly with userId, creates management record if needed
 */
userManagementSchema.statics.getUserDetails = async function(userId) {
  try {
    // Get user from main User model
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      throw new Error('User not found');
    }

    // Get or create management record
    let userManagement = await this.findOne({ userId });
    if (!userManagement) {
      // Create default management record on the fly
      userManagement = {
        status: 'active',
        adminNotes: '',
        lastReviewed: null
      };
    }

    // Get booking data
    let recentBookings = [];
    let userStats = {
      totalBookings: 0,
      totalRevenue: 0,
      lastBooking: null
    };

    try {
      const Booking = mongoose.model('Booking');
      
      // Get recent bookings
      const bookings = await Booking.find({ userId })
        .populate('hallId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      recentBookings = bookings.map(booking => ({
        _id: booking._id,
        date: booking.eventDates && booking.eventDates[0] 
          ? booking.eventDates[0].toISOString().split('T')[0] 
          : booking.createdAt.toISOString().split('T')[0],
        hall: booking.hallId?.name || 'Unknown Hall',
        amount: booking.totalAmount || 0,
        status: booking.status || 'unknown'
      }));

      // Get user stats
      const stats = await Booking.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            status: { $in: ['confirmed', 'completed'] },
            paymentStatus: 'paid'
          } 
        },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            lastBooking: { $max: '$createdAt' }
          }
        }
      ]);

      if (stats.length > 0) {
        userStats = stats[0];
      }
    } catch (error) {
      console.warn('Could not fetch user booking data:', error.message);
    }

    // Combine data
    return {
      user: {
        ...user.toObject(),
        status: userManagement.status,
        adminNotes: userManagement.adminNotes,
        lastReviewed: userManagement.lastReviewed
      },
      stats: userStats,
      recentBookings
    };
  } catch (error) {
    throw new Error(`Failed to get user details: ${error.message}`);
  }
};

/**
 * Sync single user - creates/updates UserManagement record
 * Used when updating status, notes, etc.
 */
userManagementSchema.statics.findOrCreateManagement = async function(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let userManagement = await this.findOne({ userId });
    
    if (!userManagement) {
      userManagement = new this({ userId, status: 'active' });
      await userManagement.save();
    }
    
    return userManagement;
  } catch (error) {
    throw new Error(`Failed to find/create user management: ${error.message}`);
  }
};

const UserManagement = mongoose.model("UserManagement", userManagementSchema);
export default UserManagement;