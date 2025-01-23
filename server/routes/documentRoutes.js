import express from 'express';
import { addDocument, getDocuments, getDocument, updateDocument, deleteDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { check } from 'express-validator';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client, { s3Config } from '../config/aws.js';
import path from 'path';

const router = express.Router();

// Constants for validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|pdf|doc|docx/;
const ALLOWED_DOCUMENT_TYPES = ['insurance', 'registration', 'tax', 'other'];
const TITLE_MIN_LENGTH = 2;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

// Configure multer for S3 upload
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: s3Config.bucketName,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'documents/' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: function (req, file, cb) {
        const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
        const extname = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image (JPEG, PNG), PDF, and Word documents are allowed!'));
    }
}).single('file');

// Custom validation middleware for file
const validateFile = (req, res, next) => {
    if (req.file) {
        // Validate file if one is provided
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                errors: [{ msg: 'File size must not exceed 10MB', param: 'file' }]
            });
        }

        const fileExt = path.extname(req.file.originalname).toLowerCase();
        if (!ALLOWED_FILE_TYPES.test(fileExt.substring(1))) {
            return res.status(400).json({
                errors: [{ msg: 'Invalid file type. Please upload a PDF, Word, or Image file', param: 'file' }]
            });
        }
    }

    next();
};

// Validation middleware for documents
const validateDocument = [
    check('type')
        .notEmpty().withMessage('Document type is required')
        .isIn(ALLOWED_DOCUMENT_TYPES)
        .withMessage(`Document type must be one of: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`),
    
    check('title')
        .notEmpty().withMessage('Title is required')
        .trim()
        .isLength({ min: TITLE_MIN_LENGTH, max: TITLE_MAX_LENGTH })
        .withMessage(`Title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters`)
        .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
        .withMessage('Title can only contain letters, numbers, spaces, and basic punctuation'),
    
    check('description')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: DESCRIPTION_MAX_LENGTH })
        .withMessage(`Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`)
        .custom((value) => {
            if (!value) return true; // Allow empty strings
            return /^[a-zA-Z0-9\s\-_.,()!?'"]+$/.test(value);
        })
        .withMessage('Description can only contain letters, numbers, spaces, and basic punctuation'),
    
    check('carId')
        .notEmpty().withMessage('Car ID is required')
        .isMongoId().withMessage('Invalid car ID'),
    
    check('expiryDate')
        .optional()
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            if (!value) return true;
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                throw new Error('Expiry date cannot be in the past');
            }
            return true;
        })
];

// Error handling middleware for multer
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                errors: [{ msg: 'File size must not exceed 10MB', param: 'file' }]
            });
        }
        return res.status(400).json({
            errors: [{ msg: err.message, param: 'file' }]
        });
    } else if (err) {
        return res.status(400).json({
            errors: [{ msg: err.message, param: 'file' }]
        });
    }
    next();
};

// Routes
router.post('/', protect, upload, handleUploadErrors, validateFile, validateDocument, addDocument);
router.get('/car/:carId', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, upload, handleUploadErrors, validateFile, validateDocument, updateDocument);
router.delete('/:id', protect, deleteDocument);

export default router; 