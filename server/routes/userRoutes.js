import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middlewares/authMiddleware.js';
import {
    userRegister,
    userLogin,
    getUserProfile,
} from '../controllers/userController.js';

const router = express.Router();

// Register User
router.post(
    '/register',
    [
        check('username', 'Username is required').notEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters long, contain at least one uppercase letter, and one number')
    .custom((value) => {
        const isValidLength = value.length >= 6;
        const hasNumber = /\d/.test(value);
        const hasUppercase = /[A-Z]/.test(value);

        if (!isValidLength || !hasNumber || !hasUppercase) {
            throw new Error(); // Fails validation
        }
        return true; // Passes validation
    })
    ],
    userRegister
);
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    userLogin
);
router.get('/profile', protect, getUserProfile); // this should be protected

export default router;
