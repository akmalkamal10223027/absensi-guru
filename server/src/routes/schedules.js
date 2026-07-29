import { Router } from 'express';
import {
    getAllSchedules,
    createSchedule,
    updateSchedule
} from '../controllers/scheduleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllSchedules);
router.post('/', authenticate, authorize('admin'), createSchedule);
router.put('/:id', authenticate, authorize('admin'), updateSchedule);

export default router;