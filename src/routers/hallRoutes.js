import express from 'express';
import {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall
} from '../controllers/hallController.js';

import upload from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getHalls);
router.get('/:id', getHallById);

// Protected Admin Routes
router.post(
  '/',
  protect,
  restrict('admin'),
  upload.array('images', 10),
  createHall
);

router.put(
  '/:id',
  protect,
  restrict('admin'),
  upload.array('images', 10),
  updateHall
);

router.delete(
  '/:id',
  protect,
  restrict('admin'),
  deleteHall
);

export default router;
