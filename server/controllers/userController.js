import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';



import { errorHandler } from '../utils/errorHandler.js';

// register user
export const userRegister = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Map express-validator errors to a consistent structure
        return res.status(400).json({
            errors: errors.array().map((err) => ({ msg: err.msg })) // Standardize structure
        });
    }

    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                errors: [{ msg: 'User already exists' }]
            });
        }

        user = new User({ username, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = { user: { id: user.id } };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.status(201).json({ token });
    } catch (err) {
        errorHandler(res, err, 'Failed to register user');
    }
};


// login user
export const userLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map((err) => ({ msg: err.msg }))
        });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid Credentials' }]
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid Credentials' }]
            });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.json({ token });
    } catch (err) {
        errorHandler(res, err, 'Failed to login user');
    }
};


// get user profile

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        errorHandler(res, err, 'Failed to retrieve user profile');
    }
};

