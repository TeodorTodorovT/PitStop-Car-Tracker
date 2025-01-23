import express from 'express';
import { addCar, updateCar, deleteCar } from '../controllers/carController.js';
import { protect } from '../middleware/authMiddleware.js';
import { check, validationResult } from 'express-validator';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import Car from '../models/carModel.js';
import { errorHandler } from '../utils/errorHandler.js';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'cars/' + uniqueSuffix + path.extname(file.originalname));
    }
  })
});

// Validation middleware for adding a car
const validateCar = [
    check('make')
        .trim()
        .notEmpty().withMessage('Make is required')
        .isLength({ min: 2, max: 30 }).withMessage('Make must be between 2 and 30 characters'),
    check('model')
        .trim()
        .notEmpty().withMessage('Model is required')
        .isLength({ min: 2, max: 30 }).withMessage('Model must be between 2 and 30 characters'),
    check('year')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
    check('vin')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ min: 17, max: 17 }).withMessage('VIN must be exactly 17 characters')
        .matches(/^[A-HJ-NPR-Z0-9]+$/).withMessage('Invalid VIN format'),
    check('licensePlate')
        .trim()
        .notEmpty().withMessage('License plate is required')
        .isLength({ min: 2, max: 10 }).withMessage('License plate must be between 2 and 10 characters')
        .matches(/^[A-Z0-9 -]+$/i).withMessage('License plate can only contain letters, numbers, spaces, and hyphens')
];

// Get user's cars
router.get('/', protect, async (req, res) => {
    try {
        const cars = await Car.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(cars);
    } catch (err) {
        errorHandler(res, err, 'Failed to fetch cars');
    }
});

// Get a single car by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        
        if (!car) {
            return res.status(404).json({
                errors: [{ msg: 'Car not found' }]
            });
        }

        // Make sure user owns car
        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({
                errors: [{ msg: 'Not authorized to view this car' }]
            });
        }

        res.json(car);
    } catch (err) {
        errorHandler(res, err, 'Failed to fetch car');
    }
});

// Add a new car (protected route)
router.post('/', protect, upload.single('image'), validateCar, addCar);

// Update a car (protected route)
router.put('/:id', protect, upload.single('image'), validateCar, updateCar);

// Delete a car (protected route)
router.delete('/:id', protect, deleteCar);

export default router; 