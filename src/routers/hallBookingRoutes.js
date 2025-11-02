import express from 'express';
import {
  checkAvailability,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  confirmPayment,
  getAllBookings,
  createOfflineBooking,
  updateBookingStatus,
  adminCancelBooking
} from '../controllers/hallBookingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';
import {
  validateAvailabilityCheck,
  validateBookingCreation,
  validateBookingId,
  validatePagination
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/check-availability', validateAvailabilityCheck, checkAvailability);

// Protected routes (require authentication)
router.use(protect);

// Customer routes
router.post('/', validateBookingCreation, createBooking);
router.get('/user', validatePagination, getUserBookings);
router.get('/:id', validateBookingId, getBookingById);
router.put('/:id/cancel', validateBookingId, cancelBooking);
router.put('/:id/confirm-payment', validateBookingId, confirmPayment);

// Admin/Staff routes
router.get('/', restrict('admin', 'staff'), validatePagination, getAllBookings);
router.post('/offline', restrict('admin', 'staff'), validateBookingCreation, createOfflineBooking);
router.put('/:id/status', restrict('admin', 'staff'), validateBookingId, updateBookingStatus); 
router.put('/:id/admin-cancel', restrict('admin', 'staff'), validateBookingId, adminCancelBooking); 

export default router;