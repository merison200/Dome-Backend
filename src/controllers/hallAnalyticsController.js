// import Booking from '../models/hallBooking.js';
// import Payment from '../models/hallPayment.js';
// import Hall from '../models/hall.js';

// First

// // Helper function to generate all months/years for a period
// const generateTimePeriods = (period, year) => {
//   if (period === 'monthly') {
//     return Array.from({ length: 12 }, (_, i) => ({
//       year: parseInt(year),
//       month: i + 1
//     }));
//   } else {
//     // For yearly view, generate last 5 years
//     const currentYear = parseInt(year);
//     return Array.from({ length: 5 }, (_, i) => ({
//       year: currentYear - (4 - i)
//     }));
//   }
// };

// // Helper function to fill missing periods with zero values
// const fillMissingPeriods = (data, allPeriods, dataType = 'revenue') => {
//   return allPeriods.map(period => {
//     const existing = data.find(item => {
//       if (period.month) {
//         return item._id.year === period.year && item._id.month === period.month;
//       } else {
//         return item._id.year === period.year;
//       }
//     });

//     if (existing) {
//       return existing;
//     } else {
//       // Return default structure based on data type
//       if (dataType === 'revenue') {
//         return {
//           _id: period,
//           revenue: 0,
//           transactions: 0,
//           onlineRevenue: 0,
//           offlineRevenue: 0
//         };
//       } else {
//         return {
//           _id: period,
//           totalBookings: 0,
//           onlineBookings: 0,
//           offlineBookings: 0,
//           confirmedBookings: 0,
//           cancelledBookings: 0
//         };
//       }
//     }
//   });
// };

// // Get dashboard overview
// export const getDashboardOverview = async (req, res) => {
//   try {
//     const today = new Date();
//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const startOfYear = new Date(today.getFullYear(), 0, 1);

//     // Total bookings
//     const totalBookings = await Booking.countDocuments();
//     const monthlyBookings = await Booking.countDocuments({
//       createdAt: { $gte: startOfMonth }
//     });

//     // Revenue
//     const totalRevenue = await Payment.aggregate([
//       { $match: { status: 'completed' } },
//       { $group: { _id: null, total: { $sum: '$amount' } } }
//     ]);

//     const monthlyRevenue = await Payment.aggregate([
//       { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
//       { $group: { _id: null, total: { $sum: '$amount' } } }
//     ]);

//     // Booking types
//     const bookingTypes = await Booking.aggregate([
//       { $group: { _id: '$bookingType', count: { $sum: 1 } } }
//     ]);

//     // Payment methods
//     const paymentMethods = await Payment.aggregate([
//       { $match: { status: 'completed' } },
//       { $group: { _id: '$method', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         totalBookings,
//         monthlyBookings,
//         totalRevenue: totalRevenue[0]?.total || 0,
//         monthlyRevenue: monthlyRevenue[0]?.total || 0,
//         bookingTypes,
//         paymentMethods
//       }
//     });

//   } catch (error) {
//     console.error('Dashboard overview error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get dashboard overview'
//     });
//   }
// };

// // Get revenue analytics
// export const getRevenueAnalytics = async (req, res) => {
//   try {
//     const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
//     let groupBy, dateRange;
    
//     if (period === 'monthly') {
//       groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
//       dateRange = {
//         $gte: new Date(parseInt(year), 0, 1),
//         $lt: new Date(parseInt(year) + 1, 0, 1)
//       };
//     } else {
//       groupBy = { year: { $year: '$createdAt' } };
//       const currentYear = parseInt(year);
//       dateRange = { 
//         $gte: new Date(currentYear - 4, 0, 1),
//         $lte: new Date(currentYear, 11, 31)
//       };
//     }

//     const revenueData = await Payment.aggregate([
//       { $match: { status: 'completed', createdAt: dateRange } },
//       {
//         $group: {
//           _id: groupBy,
//           revenue: { $sum: '$amount' },
//           transactions: { $sum: 1 },
//           onlineRevenue: {
//             $sum: { $cond: [{ $eq: ['$method', 'card'] }, '$amount', 0] }
//           },
//           offlineRevenue: {
//             $sum: { $cond: [{ $eq: ['$method', 'transfer'] }, '$amount', 0] }
//           }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1 } }
//     ]);

//     // Generate all time periods and fill missing ones
//     const allPeriods = generateTimePeriods(period, year);
//     const completeData = fillMissingPeriods(revenueData, allPeriods, 'revenue');

//     res.json({
//       success: true,
//       data: completeData
//     });

//   } catch (error) {
//     console.error('Revenue analytics error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get revenue analytics'
//     });
//   }
// };

// // Get booking analytics
// export const getBookingAnalytics = async (req, res) => {
//   try {
//     const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
//     let groupBy, dateRange;
    
//     if (period === 'monthly') {
//       groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
//       dateRange = {
//         $gte: new Date(parseInt(year), 0, 1),
//         $lt: new Date(parseInt(year) + 1, 0, 1)
//       };
//     } else {
//       groupBy = { year: { $year: '$createdAt' } };
//       const currentYear = parseInt(year);
//       dateRange = { 
//         $gte: new Date(currentYear - 4, 0, 1),
//         $lte: new Date(currentYear, 11, 31)
//       };
//     }

//     const bookingData = await Booking.aggregate([
//       { $match: { createdAt: dateRange } },
//       {
//         $group: {
//           _id: groupBy,
//           totalBookings: { $sum: 1 },
//           onlineBookings: {
//             $sum: { $cond: [{ $eq: ['$bookingType', 'online'] }, 1, 0] }
//           },
//           offlineBookings: {
//             $sum: { $cond: [{ $eq: ['$bookingType', 'offline'] }, 1, 0] }
//           },
//           confirmedBookings: {
//             $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
//           },
//           cancelledBookings: {
//             $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
//           }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1 } }
//     ]);

//     // Generate all time periods and fill missing ones
//     const allPeriods = generateTimePeriods(period, year);
//     const completeData = fillMissingPeriods(bookingData, allPeriods, 'booking');

//     res.json({
//       success: true,
//       data: completeData
//     });

//   } catch (error) {
//     console.error('Booking analytics error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get booking analytics'
//     });
//   }
// };

// // Get hall utilization
// export const getHallUtilization = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     const dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter.eventDates = {
//         $elemMatch: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         }
//       };
//     }

//     const hallUtilization = await Booking.aggregate([
//       { $match: { ...dateFilter, status: 'confirmed' } },
//       { $unwind: '$eventDates' },
//       {
//         $group: {
//           _id: '$hallId',
//           totalDays: { $sum: 1 },
//           bookings: { $sum: 1 },
//           revenue: { $sum: '$totalAmount' }
//         }
//       },
//       {
//         $lookup: {
//           from: 'halls',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'hall'
//         }
//       },
//       { $unwind: '$hall' },
//       {
//         $project: {
//           hallName: '$hall.name',
//           hallType: '$hall.type',
//           hallCapacity: '$hall.capacity',
//           hallLocation: '$hall.location',
//           totalDays: 1,
//           bookings: 1,
//           revenue: 1,
//           averageBookingValue: { $divide: ['$revenue', '$bookings'] },
//           utilizationRate: {
//             $multiply: [
//               { $divide: ['$totalDays', 365] },
//               100
//             ]
//           }
//         }
//       },
//       { $sort: { revenue: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: hallUtilization
//     });

//   } catch (error) {
//     console.error('Hall utilization error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get hall utilization'
//     });
//   }
// };

// // Get event type analytics
// export const getEventTypeAnalytics = async (req, res) => {
//   try {
//     const eventTypeData = await Booking.aggregate([
//       { $match: { status: 'confirmed' } },
//       {
//         $group: {
//           _id: '$eventType',
//           count: { $sum: 1 },
//           revenue: { $sum: '$totalAmount' }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: eventTypeData
//     });

//   } catch (error) {
//     console.error('Event type analytics error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get event type analytics'
//     });
//   }
// };

// // Get hall performance analytics
// export const getHallPerformance = async (req, res) => {
//   try {
//     const hallPerformance = await Hall.aggregate([
//       {
//         $lookup: {
//           from: 'bookings',
//           localField: '_id',
//           foreignField: 'hallId',
//           as: 'bookings'
//         }
//       },
//       {
//         $project: {
//           name: 1,
//           type: 1,
//           capacity: 1,
//           basePrice: 1,
//           location: 1,
//           rating: 1,
//           totalBookings: { $size: '$bookings' },
//           confirmedBookings: {
//             $size: {
//               $filter: {
//                 input: '$bookings',
//                 cond: { $eq: ['$$this.status', 'confirmed'] }
//               }
//             }
//           },
//           totalRevenue: {
//             $sum: {
//               $map: {
//                 input: {
//                   $filter: {
//                     input: '$bookings',
//                     cond: { $eq: ['$$this.status', 'confirmed'] }
//                   }
//                 },
//                 as: 'booking',
//                 in: '$$booking.totalAmount'
//               }
//             }
//           }
//         }
//       },
//       {
//         $addFields: {
//           averageBookingValue: {
//             $cond: {
//               if: { $gt: ['$confirmedBookings', 0] },
//               then: { $divide: ['$totalRevenue', '$confirmedBookings'] },
//               else: 0
//             }
//           }
//         }
//       },
//       { $sort: { totalRevenue: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: hallPerformance
//     });

//   } catch (error) {
//     console.error('Hall performance error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get hall performance'
//     });
//   }
// };



// Second

// import Booking from '../models/hallBooking.js';
// import Payment from '../models/hallPayment.js';
// import Hall from '../models/hall.js';

// // Helper function to get revenue match conditions
// const getRevenueMatchConditions = (additionalConditions = {}) => {
//   return {
//     status: 'completed',
//     $or: [
//       { refundStatus: { $in: ['none', null] } },
//       { refundStatus: 'partial' }
//     ],
//     ...additionalConditions
//   };
// };

// // Helper function to calculate net revenue (after refunds)
// const calculateNetRevenue = () => {
//   return {
//     $subtract: ['$netAmount', { $ifNull: ['$refundAmount', 0] }]
//   };
// };

// // Helper function to generate all months/years for a period
// const generateTimePeriods = (period, year) => {
//   if (period === 'monthly') {
//     return Array.from({ length: 12 }, (_, i) => ({
//       year: parseInt(year),
//       month: i + 1
//     }));
//   } else {
//     // For yearly view, generate last 5 years
//     const currentYear = parseInt(year);
//     return Array.from({ length: 5 }, (_, i) => ({
//       year: currentYear - (4 - i)
//     }));
//   }
// };

// // Helper function to fill missing periods with zero values
// const fillMissingPeriods = (data, allPeriods, dataType = 'revenue') => {
//   return allPeriods.map(period => {
//     const existing = data.find(item => {
//       if (period.month) {
//         return item._id.year === period.year && item._id.month === period.month;
//       } else {
//         return item._id.year === period.year;
//       }
//     });

//     if (existing) {
//       return existing;
//     } else {
//       // Return default structure based on data type
//       if (dataType === 'revenue') {
//         return {
//           _id: period,
//           revenue: 0,
//           transactions: 0,
//           onlineRevenue: 0,
//           offlineRevenue: 0
//         };
//       } else {
//         return {
//           _id: period,
//           totalBookings: 0,
//           onlineBookings: 0,
//           offlineBookings: 0,
//           confirmedBookings: 0,
//           cancelledBookings: 0
//         };
//       }
//     }
//   });
// };

// // Get dashboard overview - FIXED
// export const getDashboardOverview = async (req, res) => {
//   try {
//     const today = new Date();
//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const startOfYear = new Date(today.getFullYear(), 0, 1);

//     // Total bookings - only count confirmed/completed
//     const totalBookings = await Booking.countDocuments({
//       status: { $in: ['confirmed', 'completed'] }
//     });
    
//     const monthlyBookings = await Booking.countDocuments({
//       createdAt: { $gte: startOfMonth },
//       status: { $in: ['confirmed', 'completed'] }
//     });

//     // Revenue - FIXED to use proper conditions and netRevenue calculation
//     const totalRevenue = await Payment.aggregate([
//       { $match: getRevenueMatchConditions() },
//       { 
//         $group: { 
//           _id: null, 
//           total: { $sum: calculateNetRevenue() } 
//         } 
//       }
//     ]);

//     const monthlyRevenue = await Payment.aggregate([
//       { 
//         $match: getRevenueMatchConditions({ 
//           createdAt: { $gte: startOfMonth } 
//         }) 
//       },
//       { 
//         $group: { 
//           _id: null, 
//           total: { $sum: calculateNetRevenue() } 
//         } 
//       }
//     ]);

//     // Booking types - only count confirmed/completed
//     const bookingTypes = await Booking.aggregate([
//       { $match: { status: { $in: ['confirmed', 'completed'] } } },
//       { $group: { _id: '$bookingType', count: { $sum: 1 } } }
//     ]);

//     // Payment methods - FIXED to use revenue conditions
//     const paymentMethods = await Payment.aggregate([
//       { $match: getRevenueMatchConditions() },
//       { 
//         $group: { 
//           _id: '$method', 
//           count: { $sum: 1 }, 
//           revenue: { $sum: calculateNetRevenue() } 
//         } 
//       }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         totalBookings,
//         monthlyBookings,
//         totalRevenue: totalRevenue[0]?.total || 0,
//         monthlyRevenue: monthlyRevenue[0]?.total || 0,
//         bookingTypes,
//         paymentMethods
//       }
//     });

//   } catch (error) {
//     console.error('Dashboard overview error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get dashboard overview'
//     });
//   }
// };

// // Get revenue analytics - FIXED
// export const getRevenueAnalytics = async (req, res) => {
//   try {
//     const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
//     let groupBy, dateRange;
    
//     if (period === 'monthly') {
//       groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
//       dateRange = {
//         $gte: new Date(parseInt(year), 0, 1),
//         $lt: new Date(parseInt(year) + 1, 0, 1)
//       };
//     } else {
//       groupBy = { year: { $year: '$createdAt' } };
//       const currentYear = parseInt(year);
//       dateRange = { 
//         $gte: new Date(currentYear - 4, 0, 1),
//         $lte: new Date(currentYear, 11, 31)
//       };
//     }

//     // FIXED - Use proper revenue conditions and netRevenue calculation
//     const revenueData = await Payment.aggregate([
//       { 
//         $match: getRevenueMatchConditions({ 
//           createdAt: dateRange 
//         }) 
//       },
//       {
//         $group: {
//           _id: groupBy,
//           revenue: { $sum: calculateNetRevenue() },
//           transactions: { $sum: 1 },
//           onlineRevenue: {
//             $sum: { 
//               $cond: [
//                 { $eq: ['$method', 'card'] }, 
//                 calculateNetRevenue(), 
//                 0
//               ] 
//             }
//           },
//           offlineRevenue: {
//             $sum: { 
//               $cond: [
//                 { $eq: ['$method', 'transfer'] }, 
//                 calculateNetRevenue(), 
//                 0
//               ] 
//             }
//           }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1 } }
//     ]);

//     // Generate all time periods and fill missing ones
//     const allPeriods = generateTimePeriods(period, year);
//     const completeData = fillMissingPeriods(revenueData, allPeriods, 'revenue');

//     res.json({
//       success: true,
//       data: completeData
//     });

//   } catch (error) {
//     console.error('Revenue analytics error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get revenue analytics'
//     });
//   }
// };

// // Get booking analytics - FIXED
// export const getBookingAnalytics = async (req, res) => {
//   try {
//     const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
//     let groupBy, dateRange;
    
//     if (period === 'monthly') {
//       groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
//       dateRange = {
//         $gte: new Date(parseInt(year), 0, 1),
//         $lt: new Date(parseInt(year) + 1, 0, 1)
//       };
//     } else {
//       groupBy = { year: { $year: '$createdAt' } };
//       const currentYear = parseInt(year);
//       dateRange = { 
//         $gte: new Date(currentYear - 4, 0, 1),
//         $lte: new Date(currentYear, 11, 31)
//       };
//     }

//     const bookingData = await Booking.aggregate([
//       { $match: { createdAt: dateRange } },
//       {
//         $group: {
//           _id: groupBy,
//           totalBookings: { $sum: 1 },
//           onlineBookings: {
//             $sum: { $cond: [{ $eq: ['$bookingType', 'online'] }, 1, 0] }
//           },
//           offlineBookings: {
//             $sum: { $cond: [{ $eq: ['$bookingType', 'offline'] }, 1, 0] }
//           },
//           confirmedBookings: {
//             $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
//           },
//           cancelledBookings: {
//             $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
//           }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1 } }
//     ]);

//     // Generate all time periods and fill missing ones
//     const allPeriods = generateTimePeriods(period, year);
//     const completeData = fillMissingPeriods(bookingData, allPeriods, 'booking');

//     res.json({
//       success: true,
//       data: completeData
//     });

//   } catch (error) {
//     console.error('Booking analytics error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get booking analytics'
//     });
//   }
// };

// // Get hall utilization - FIXED
// export const getHallUtilization = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
    
//     const dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter.eventDates = {
//         $elemMatch: {
//           $gte: new Date(startDate),
//           $lte: new Date(endDate)
//         }
//       };
//     }

//     // FIXED - Only count confirmed bookings and calculate revenue properly
//     const hallUtilization = await Booking.aggregate([
//       { $match: { ...dateFilter, status: 'confirmed' } },
//       { $unwind: '$eventDates' },
//       {
//         $group: {
//           _id: '$hallId',
//           totalDays: { $sum: 1 },
//           bookings: { $addToSet: '$_id' }
//         }
//       },
//       {
//         $lookup: {
//           from: 'halls',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'hall'
//         }
//       },
//       { $unwind: '$hall' },
//       {
//         $lookup: {
//           from: 'payments',
//           let: { hallId: '$_id' },
//           pipeline: [
//             {
//               $lookup: {
//                 from: 'bookings',
//                 localField: 'bookingId',
//                 foreignField: '_id',
//                 as: 'booking'
//               }
//             },
//             { $unwind: '$booking' },
//             {
//               $match: {
//                 $expr: { $eq: ['$booking.hallId', '$$hallId'] },
//                 status: 'completed',
//                 $or: [
//                   { refundStatus: { $in: ['none', null] } },
//                   { refundStatus: 'partial' }
//                 ]
//               }
//             }
//           ],
//           as: 'payments'
//         }
//       },
//       {
//         $project: {
//           hallName: '$hall.name',
//           hallType: '$hall.type',
//           hallCapacity: '$hall.capacity',
//           hallLocation: '$hall.location',
//           totalDays: 1,
//           bookings: { $size: '$bookings' },
//           revenue: {
//             $sum: {
//               $map: {
//                 input: '$payments',
//                 as: 'payment',
//                 in: {
//                   $subtract: [
//                     '$$payment.netAmount',
//                     { $ifNull: ['$$payment.refundAmount', 0] }
//                   ]
//                 }
//               }
//             }
//           }
//         }
//       },
//       {
//         $addFields: {
//           averageBookingValue: {
//             $cond: {
//               if: { $gt: ['$bookings', 0] },
//               then: { $divide: ['$revenue', '$bookings'] },
//               else: 0
//             }
//           },
//           utilizationRate: {
//             $multiply: [
//               { $divide: ['$totalDays', 365] },
//               100
//             ]
//           }
//         }
//       },
//       { $sort: { revenue: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: hallUtilization
//     });

//   } catch (error) {
//     console.error('Hall utilization error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get hall utilization'
//     });
//   }
// };

// // Get event type analytics - FIXED
// export const getEventTypeAnalytics = async (req, res) => {
//   try {
//     // FIXED - Join with payments to get accurate revenue
//     const eventTypeData = await Booking.aggregate([
//       { $match: { status: 'confirmed' } },
//       {
//         $lookup: {
//           from: 'payments',
//           localField: '_id',
//           foreignField: 'bookingId',
//           as: 'payment'
//         }
//       },
//       { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
//       {
//         $match: {
//           $or: [
//             { 'payment.status': 'completed' },
//             { payment: { $exists: false } }
//           ]
//         }
//       },
//       {
//         $group: {
//           _id: '$eventType',
//           count: { $sum: 1 },
//           revenue: {
//             $sum: {
//               $cond: [
//                 { $eq: ['$payment.status', 'completed'] },
//                 {
//                   $subtract: [
//                     { $ifNull: ['$payment.netAmount', 0] },
//                     { $ifNull: ['$payment.refundAmount', 0] }
//                   ]
//                 },
//                 0
//               ]
//             }
//           }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: eventTypeData
//     });

//   } catch (error) {
//     console.error('Event type analytics error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get event type analytics'
//     });
//   }
// };

// // Get hall performance analytics - FIXED
// export const getHallPerformance = async (req, res) => {
//   try {
//     const hallPerformance = await Hall.aggregate([
//       {
//         $lookup: {
//           from: 'bookings',
//           localField: '_id',
//           foreignField: 'hallId',
//           as: 'bookings'
//         }
//       },
//       {
//         $lookup: {
//           from: 'payments',
//           let: { hallId: '$_id' },
//           pipeline: [
//             {
//               $lookup: {
//                 from: 'bookings',
//                 localField: 'bookingId',
//                 foreignField: '_id',
//                 as: 'booking'
//               }
//             },
//             { $unwind: '$booking' },
//             {
//               $match: {
//                 $expr: { $eq: ['$booking.hallId', '$$hallId'] },
//                 status: 'completed',
//                 $or: [
//                   { refundStatus: { $in: ['none', null] } },
//                   { refundStatus: 'partial' }
//                 ]
//               }
//             }
//           ],
//           as: 'payments'
//         }
//       },
//       {
//         $project: {
//           name: 1,
//           type: 1,
//           capacity: 1,
//           basePrice: 1,
//           location: 1,
//           rating: 1,
//           totalBookings: { $size: '$bookings' },
//           confirmedBookings: {
//             $size: {
//               $filter: {
//                 input: '$bookings',
//                 cond: { $eq: ['$$this.status', 'confirmed'] }
//               }
//             }
//           },
//           totalRevenue: {
//             $sum: {
//               $map: {
//                 input: '$payments',
//                 as: 'payment',
//                 in: {
//                   $subtract: [
//                     '$$payment.netAmount',
//                     { $ifNull: ['$$payment.refundAmount', 0] }
//                   ]
//                 }
//               }
//             }
//           }
//         }
//       },
//       {
//         $addFields: {
//           averageBookingValue: {
//             $cond: {
//               if: { $gt: ['$confirmedBookings', 0] },
//               then: { $divide: ['$totalRevenue', '$confirmedBookings'] },
//               else: 0
//             }
//           }
//         }
//       },
//       { $sort: { totalRevenue: -1 } }
//     ]);

//     res.json({
//       success: true,
//       data: hallPerformance
//     });

//   } catch (error) {
//     console.error('Hall performance error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get hall performance'
//     });
//   }
// };


//Third

import Booking from '../models/hallBooking.js';
import Payment from '../models/hallPayment.js';
import Hall from '../models/hall.js';

// Helper function to get revenue match conditions
const getRevenueMatchConditions = (additionalConditions = {}) => {
  return {
    status: 'completed',
    $or: [
      { refundStatus: { $in: ['none', null] } },
      { refundStatus: 'partial' }
    ],
    ...additionalConditions
  };
};

// Helper function to calculate gross revenue (before gateway fees)
const calculateGrossRevenue = () => {
  return {
    $subtract: ['$amount', { $ifNull: ['$refundAmount', 0] }]
  };
};

// Helper function to generate all months/years for a period
const generateTimePeriods = (period, year) => {
  if (period === 'monthly') {
    return Array.from({ length: 12 }, (_, i) => ({
      year: parseInt(year),
      month: i + 1
    }));
  } else {
    // For yearly view, generate last 5 years
    const currentYear = parseInt(year);
    return Array.from({ length: 5 }, (_, i) => ({
      year: currentYear - (4 - i)
    }));
  }
};

// Helper function to fill missing periods with zero values
const fillMissingPeriods = (data, allPeriods, dataType = 'revenue') => {
  return allPeriods.map(period => {
    const existing = data.find(item => {
      if (period.month) {
        return item._id.year === period.year && item._id.month === period.month;
      } else {
        return item._id.year === period.year;
      }
    });

    if (existing) {
      return existing;
    } else {
      // Return default structure based on data type
      if (dataType === 'revenue') {
        return {
          _id: period,
          revenue: 0,
          transactions: 0,
          onlineRevenue: 0,
          offlineRevenue: 0
        };
      } else {
        return {
          _id: period,
          totalBookings: 0,
          onlineBookings: 0,
          offlineBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0
        };
      }
    }
  });
};

// Get dashboard overview - USING GROSS REVENUE
export const getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total bookings - only count confirmed/completed
    const totalBookings = await Booking.countDocuments({
      status: { $in: ['confirmed', 'completed'] }
    });
    
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth },
      status: { $in: ['confirmed', 'completed'] }
    });

    // Revenue - USING GROSS REVENUE (amount instead of netAmount)
    const totalRevenue = await Payment.aggregate([
      { $match: getRevenueMatchConditions() },
      { 
        $group: { 
          _id: null, 
          total: { $sum: calculateGrossRevenue() } 
        } 
      }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: getRevenueMatchConditions({ 
          createdAt: { $gte: startOfMonth } 
        }) 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: calculateGrossRevenue() } 
        } 
      }
    ]);

    // Booking types - only count confirmed/completed
    const bookingTypes = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$bookingType', count: { $sum: 1 } } }
    ]);

    // Payment methods - USING GROSS REVENUE
    const paymentMethods = await Payment.aggregate([
      { $match: getRevenueMatchConditions() },
      { 
        $group: { 
          _id: '$method', 
          count: { $sum: 1 }, 
          revenue: { $sum: calculateGrossRevenue() } 
        } 
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        monthlyBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        bookingTypes,
        paymentMethods
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview'
    });
  }
};

// Get revenue analytics - USING GROSS REVENUE
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let groupBy, dateRange;
    
    if (period === 'monthly') {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      dateRange = {
        $gte: new Date(parseInt(year), 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1)
      };
    } else {
      groupBy = { year: { $year: '$createdAt' } };
      const currentYear = parseInt(year);
      dateRange = { 
        $gte: new Date(currentYear - 4, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      };
    }

    // USING GROSS REVENUE
    const revenueData = await Payment.aggregate([
      { 
        $match: getRevenueMatchConditions({ 
          createdAt: dateRange 
        }) 
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: calculateGrossRevenue() },
          transactions: { $sum: 1 },
          onlineRevenue: {
            $sum: { 
              $cond: [
                { $eq: ['$method', 'card'] }, 
                calculateGrossRevenue(), 
                0
              ] 
            }
          },
          offlineRevenue: {
            $sum: { 
              $cond: [
                { $eq: ['$method', 'transfer'] }, 
                calculateGrossRevenue(), 
                0
              ] 
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Generate all time periods and fill missing ones
    const allPeriods = generateTimePeriods(period, year);
    const completeData = fillMissingPeriods(revenueData, allPeriods, 'revenue');

    res.json({
      success: true,
      data: completeData
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics'
    });
  }
};

// Get booking analytics - UNCHANGED (no revenue calculations here)
export const getBookingAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let groupBy, dateRange;
    
    if (period === 'monthly') {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      dateRange = {
        $gte: new Date(parseInt(year), 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1)
      };
    } else {
      groupBy = { year: { $year: '$createdAt' } };
      const currentYear = parseInt(year);
      dateRange = { 
        $gte: new Date(currentYear - 4, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      };
    }

    const bookingData = await Booking.aggregate([
      { $match: { createdAt: dateRange } },
      {
        $group: {
          _id: groupBy,
          totalBookings: { $sum: 1 },
          onlineBookings: {
            $sum: { $cond: [{ $eq: ['$bookingType', 'online'] }, 1, 0] }
          },
          offlineBookings: {
            $sum: { $cond: [{ $eq: ['$bookingType', 'offline'] }, 1, 0] }
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Generate all time periods and fill missing ones
    const allPeriods = generateTimePeriods(period, year);
    const completeData = fillMissingPeriods(bookingData, allPeriods, 'booking');

    res.json({
      success: true,
      data: completeData
    });

  } catch (error) {
    console.error('Booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking analytics'
    });
  }
};

// Get hall utilization - USING GROSS REVENUE
export const getHallUtilization = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.eventDates = {
        $elemMatch: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // USING GROSS REVENUE
    const hallUtilization = await Booking.aggregate([
      { $match: { ...dateFilter, status: 'confirmed' } },
      { $unwind: '$eventDates' },
      {
        $group: {
          _id: '$hallId',
          totalDays: { $sum: 1 },
          bookings: { $addToSet: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'halls',
          localField: '_id',
          foreignField: '_id',
          as: 'hall'
        }
      },
      { $unwind: '$hall' },
      {
        $lookup: {
          from: 'payments',
          let: { hallId: '$_id' },
          pipeline: [
            {
              $lookup: {
                from: 'bookings',
                localField: 'bookingId',
                foreignField: '_id',
                as: 'booking'
              }
            },
            { $unwind: '$booking' },
            {
              $match: {
                $expr: { $eq: ['$booking.hallId', '$$hallId'] },
                status: 'completed',
                $or: [
                  { refundStatus: { $in: ['none', null] } },
                  { refundStatus: 'partial' }
                ]
              }
            }
          ],
          as: 'payments'
        }
      },
      {
        $project: {
          hallName: '$hall.name',
          hallType: '$hall.type',
          hallCapacity: '$hall.capacity',
          hallLocation: '$hall.location',
          totalDays: 1,
          bookings: { $size: '$bookings' },
          revenue: {
            $sum: {
              $map: {
                input: '$payments',
                as: 'payment',
                in: {
                  $subtract: [
                    '$$payment.amount', // USING amount INSTEAD OF netAmount
                    { $ifNull: ['$$payment.refundAmount', 0] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          averageBookingValue: {
            $cond: {
              if: { $gt: ['$bookings', 0] },
              then: { $divide: ['$revenue', '$bookings'] },
              else: 0
            }
          },
          utilizationRate: {
            $multiply: [
              { $divide: ['$totalDays', 365] },
              100
            ]
          }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      success: true,
      data: hallUtilization
    });

  } catch (error) {
    console.error('Hall utilization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hall utilization'
    });
  }
};

// Get event type analytics - USING GROSS REVENUE
export const getEventTypeAnalytics = async (req, res) => {
  try {
    // USING GROSS REVENUE
    const eventTypeData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'bookingId',
          as: 'payment'
        }
      },
      { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { 'payment.status': 'completed' },
            { payment: { $exists: false } }
          ]
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$payment.status', 'completed'] },
                {
                  $subtract: [
                    { $ifNull: ['$payment.amount', 0] }, // USING amount INSTEAD OF netAmount
                    { $ifNull: ['$payment.refundAmount', 0] }
                  ]
                },
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: eventTypeData
    });

  } catch (error) {
    console.error('Event type analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event type analytics'
    });
  }
};

// Get hall performance analytics - USING GROSS REVENUE
export const getHallPerformance = async (req, res) => {
  try {
    const hallPerformance = await Hall.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'hallId',
          as: 'bookings'
        }
      },
      {
        $lookup: {
          from: 'payments',
          let: { hallId: '$_id' },
          pipeline: [
            {
              $lookup: {
                from: 'bookings',
                localField: 'bookingId',
                foreignField: '_id',
                as: 'booking'
              }
            },
            { $unwind: '$booking' },
            {
              $match: {
                $expr: { $eq: ['$booking.hallId', '$$hallId'] },
                status: 'completed',
                $or: [
                  { refundStatus: { $in: ['none', null] } },
                  { refundStatus: 'partial' }
                ]
              }
            }
          ],
          as: 'payments'
        }
      },
      {
        $project: {
          name: 1,
          type: 1,
          capacity: 1,
          basePrice: 1,
          location: 1,
          rating: 1,
          totalBookings: { $size: '$bookings' },
          confirmedBookings: {
            $size: {
              $filter: {
                input: '$bookings',
                cond: { $eq: ['$$this.status', 'confirmed'] }
              }
            }
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$payments',
                as: 'payment',
                in: {
                  $subtract: [
                    '$$payment.amount', // USING amount INSTEAD OF netAmount
                    { $ifNull: ['$$payment.refundAmount', 0] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          averageBookingValue: {
            $cond: {
              if: { $gt: ['$confirmedBookings', 0] },
              then: { $divide: ['$totalRevenue', '$confirmedBookings'] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      data: hallPerformance
    });

  } catch (error) {
    console.error('Hall performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hall performance'
    });
  }
};

// NEW: Get payment analytics with gross/net breakdown
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    let groupBy, dateRange;
    
    if (period === 'monthly') {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      dateRange = {
        $gte: new Date(parseInt(year), 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1)
      };
    } else {
      groupBy = { year: { $year: '$createdAt' } };
      const currentYear = parseInt(year);
      dateRange = { 
        $gte: new Date(currentYear - 4, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      };
    }

    const paymentAnalytics = await Payment.aggregate([
      { 
        $match: getRevenueMatchConditions({ 
          createdAt: dateRange 
        }) 
      },
      {
        $group: {
          _id: groupBy,
          grossRevenue: { $sum: calculateGrossRevenue() },
          netRevenue: { 
            $sum: {
              $subtract: ['$netAmount', { $ifNull: ['$refundAmount', 0] }]
            }
          },
          gatewayFees: { $sum: '$gatewayFee' },
          transactions: { $sum: 1 },
          refunds: { $sum: '$refundAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Generate all time periods and fill missing ones
    const allPeriods = generateTimePeriods(period, year);
    const completeData = fillMissingPeriods(paymentAnalytics, allPeriods, 'payment');

    res.json({
      success: true,
      data: completeData
    });

  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment analytics'
    });
  }
};