import express from 'express';
import { addDocument, getDocuments, getDocument, updateDocument, deleteDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { check } from 'express-validator';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client, { s3Config } from '../config/aws.js';
import path from 'path';

const router = express.Router();

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
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image, PDF, and Word documents are allowed!'));
    }
}).single('file');

// Validation middleware for documents
const validateDocument = [
    check('type')
        .notEmpty().withMessage('Document type is required')
        .isIn(['insurance', 'registration', 'tax', 'maintenance', 'other'])
        .withMessage('Invalid document type'),
    check('title')
        .notEmpty().withMessage('Title is required')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
    check('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    check('carId')
        .notEmpty().withMessage('Car ID is required')
        .isMongoId().withMessage('Invalid car ID'),
    check('expiryDate')
        .optional()
        .isISO8601().withMessage('Invalid date format')
];

// Routes
router.post('/', protect, upload, validateDocument, addDocument);
router.get('/car/:carId', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, upload, validateDocument, updateDocument);
router.delete('/:id', protect, deleteDocument);

export default router; 