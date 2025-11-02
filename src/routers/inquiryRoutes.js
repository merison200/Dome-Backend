import express from "express";
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  deleteInquiry,
  replyToInquiry,
  updateInquiryStatus
} from "../controllers/inquiry/inquiryController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { restrict } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/", createInquiry);

// Protected Admin Routes
router.get("/", protect, restrict("admin", "staff"), getInquiries);
router.get("/:id", protect, restrict("admin"), getInquiryById);
router.delete("/:id", protect, restrict("admin"), deleteInquiry);
router.post('/:id/reply', protect, restrict("admin"), replyToInquiry);
router.put('/:id/status', protect, restrict("admin"), updateInquiryStatus);

export default router;
