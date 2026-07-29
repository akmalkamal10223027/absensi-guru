import { Router } from 'express';
import {
    checkIn, checkOut, getTodayAttendance, getAttendanceHistory,
    getAllAttendance, getDashboardStats, getRecentAttendance
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Teacher routes
router.post('/check-in', authenticate, upload.single('photo'), checkIn);
router.post('/check-out', authenticate, upload.single('photo'), checkOut);
router.get('/today', authenticate, getTodayAttendance);
router.get('/history', authenticate, getAttendanceHistory);

// Admin routes
router.get('/all', authenticate, authorize('admin'), getAllAttendance);
router.get('/dashboard-stats', authenticate, authorize('admin'), getDashboardStats);
router.get('/recent', authenticate, authorize('admin'), getRecentAttendance);

export default router;