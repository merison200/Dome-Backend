import express from 'express';
import {
  getNotifications,
  getNotificationCounts
} from '../controllers/hallNotificationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All notification routes require authentication and admin/staff access
router.use(protect);
router.use(restrict('admin', 'staff'));

// Get notification counts only (for badge/header)
router.get('/counts', getNotificationCounts);

// Get urgent notifications only
router.get('/urgent', (req, res, next) => {
  req.urgentOnly = true;
  next();
}, getNotifications);

// Get notifications by type
router.get('/type/:type', (req, res, next) => {
  const validTypes = ['pending_booking', 'transfer_verification', 'payment_failed', 'payment_completed'];
  if (!validTypes.includes(req.params.type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid notification type'
    });
  }
  req.notificationType = req.params.type;
  next();
}, getNotifications);

// Get all notifications with details (this must be last)
// Optional query params: ?limit=10&priority=high
router.get('/', getNotifications);

export default router;