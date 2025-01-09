import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/errorHandler.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Add user id to request
            req.user = decoded.user;
            next();
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Auth middleware error:', err);
            }
            return res.status(401).json({
                errors: [{ msg: 'Not authorized, token failed' }]
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            errors: [{ msg: 'Not authorized, no token' }]
        });
    }
}; 