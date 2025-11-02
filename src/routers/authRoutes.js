import express from 'express';
import {
  registerUser,
  loginUser,
  getUserStatus,
  forgotPassword,
  resetPassword,
  validateResetToken,
  logoutUser,
  getUserProfile,
  changePassword,
  updateUserProfile
} from '../controllers/authController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/status', protect, getUserStatus);

router.post('/forgot-password', forgotPassword);

router.put('/reset-password/:token', resetPassword);

router.get('/validate-reset-token/:token', validateResetToken);

router.post('/logout', logoutUser);

router.get('/profile', protect, getUserProfile);

router.put('/change-password', protect, changePassword);

router.put('/profile', protect, updateUserProfile);

export default router;
