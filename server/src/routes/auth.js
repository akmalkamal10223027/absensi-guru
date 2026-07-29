import { Router } from 'express';
import {
    login,
    getProfile,
    updateProfile,
    changePassword,
    uploadPhoto
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes (harus login)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/upload-photo', authenticate, upload.single('photo'), uploadPhoto);

export default router;