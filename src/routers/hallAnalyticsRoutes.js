import express from 'express';
import {
  getDashboardOverview,
  getRevenueAnalytics,
  getBookingAnalytics,
  getHallUtilization,
  getEventTypeAnalytics,
  getHallPerformance
} from '../controllers/hallAnalyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All analytics routes require authentication and admin/staff access
router.use(protect);
router.use(restrict('admin', 'staff'));

// Dashboard overview with key metrics
router.get('/dashboard', getDashboardOverview);

// Revenue analytics with time periods
router.get('/revenue', getRevenueAnalytics);

// Booking analytics and trends
router.get('/bookings', getBookingAnalytics);

// Hall utilization and performance
router.get('/halls/utilization', getHallUtilization);
router.get('/halls/performance', getHallPerformance);

// Event type popularity
router.get('/events', getEventTypeAnalytics);

export default router;