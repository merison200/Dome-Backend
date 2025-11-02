import express from 'express';
import {
  getUserAnalytics,
  getUsers,
  getUserDetails,
  updateUserRole,
  updateUserStatus,
  updateBulkUserStatus,
  updateUserNotes,
  sendUserEmail,
} from '../controllers/dashboard/userManagement.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, restrict('admin', 'staff'));

router.get('/analytics', getUserAnalytics);  //done
router.put('/bulk-status', updateBulkUserStatus); //done

router.get('/', getUsers);  //done                         

router.get('/:userId', getUserDetails);  //done
router.put('/:userId/role', updateUserRole);  //done
router.put('/:userId/status', updateUserStatus); //done
router.put('/:userId/notes', updateUserNotes);
router.post('/:userId/send-email', sendUserEmail);  //done

export default router;