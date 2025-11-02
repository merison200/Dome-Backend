import express from 'express';
import {
  createLounge,
  getAllLounges,
  getLoungeById,
  updateLounge,
  deleteLounge,
} from '../controllers/loungeController.js';

import upload from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getAllLounges);
router.get('/:id', getLoungeById);

// Protected Admin Routes
router.post(
  '/',
  protect,
  restrict('admin', 'staff'),
  upload.array('images', 10),
  createLounge
);

router.put(
  '/:id',
  protect,
  restrict('admin', 'staff'),
  upload.array('images', 10),
  updateLounge
);

router.delete(
  '/:id',
  protect,
  restrict('admin', 'staff'),
  deleteLounge
);

export default router;
