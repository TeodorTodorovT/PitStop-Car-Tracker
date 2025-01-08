export const errorHandler = (res, error, customMessage = 'Server Error') => {
    console.error(error); // Log error details for debugging

    res.status(500).json({
        errors: [
            {
                msg: customMessage,
                error: process.env.NODE_ENV === 'development' ? error.message : null // Include detailed error in dev mode
            }
        ]
    });
};
