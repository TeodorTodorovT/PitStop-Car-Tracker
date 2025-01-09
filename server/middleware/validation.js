import { check } from 'express-validator';

export const validateRegistration = [
    check('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
        .isLength({ max: 30 }).withMessage('Username cannot exceed 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    check('email')
        .isEmail().withMessage('Please include a valid email')
        .isLength({ max: 50 }).withMessage('Email cannot exceed 50 characters'),
    check('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .isLength({ max: 50 }).withMessage('Password cannot exceed 50 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
];

export const validateLogin = [
    check('email')
        .isEmail().withMessage('Please include a valid email')
        .isLength({ max: 50 }).withMessage('Email cannot exceed 50 characters'),
    check('password')
        .exists().withMessage('Password is required')
        .isLength({ max: 50 }).withMessage('Password cannot exceed 50 characters')
]; 