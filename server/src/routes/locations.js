import { Router } from 'express';
import {
    getAllLocations,
    createLocation,
    updateLocation
} from '../controllers/locationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllLocations);
router.post('/', authenticate, authorize('admin'), createLocation);
router.put('/:id', authenticate, authorize('admin'), updateLocation);

export default router;
