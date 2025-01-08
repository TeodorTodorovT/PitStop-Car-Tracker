import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { errorHandler } from '../utils/errorHandler.js'; // Import the errorHandler

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select(
                '-password'
            );

            next();
        } catch (err) {
            return res.status(401).json({
                errors: [{ msg: 'Not authorized, token failed' }]
            });
        }
    } else {
        return res.status(401).json({
            errors: [{ msg: 'Not authorized, no token provided' }]
        });
    }
};

