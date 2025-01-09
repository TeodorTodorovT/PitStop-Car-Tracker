export const errorHandler = (res, error, defaultMessage = 'Server Error') => {
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', error);
    }

    // Handle different types of errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            errors: [{ msg: error.message }]
        });
    }

    if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(400).json({
            errors: [{ msg: 'Duplicate field value entered' }]
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            errors: [{ msg: 'Resource not found' }]
        });
    }

    // Default error response
    return res.status(500).json({
        errors: [{ msg: process.env.NODE_ENV === 'production' ? defaultMessage : error.message }]
    });
};
