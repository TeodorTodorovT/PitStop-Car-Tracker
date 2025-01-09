import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register user
router.post('/register', validateRegistration, registerUser);

// Login user
router.post('/login', validateLogin, loginUser);

// Get user profile (protected route)
router.get('/profile', protect, getUserProfile);

export default router;
