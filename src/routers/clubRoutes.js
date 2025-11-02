import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} from '../controllers/clubController.js';

import upload from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected Admin Routes
router.post(
  '/',
  protect,
  restrict('admin'),
  upload.array('images', 10),
  createEvent
);

router.put(
  '/:id',
  protect,
  restrict('admin'),
  upload.array('images', 10),
  updateEvent
);

router.delete(
  '/:id',
  protect,
  restrict('admin'),
  deleteEvent
);

export default router;