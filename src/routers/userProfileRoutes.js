// routes/profileRoutes.js
import express from "express";
import {
  getUserBookings,
  getUserPayments,
  getUserNotifications,
  markAsRead,
  getProfileSummary,
} from "../controllers/dashboard/userProfileController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/bookings", protect, getUserBookings);
router.get("/payments", protect, getUserPayments);
router.get("/notifications", protect, getUserNotifications);
router.patch("/notifications/:id/read", protect, markAsRead);

router.get("/", protect, getProfileSummary);

export default router;
