import Car from '../models/carModel.js';
import { validationResult } from 'express-validator';
import { errorHandler } from '../utils/errorHandler.js';
import { deleteS3Object } from '../config/aws.js';

// Add a new car
export const addCar = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { make, model, year, vin, licensePlate } = req.body;
        
        // Convert year to number
        const yearNum = parseInt(year, 10);

        const car = new Car({
            user: req.user.id,
            make,
            model,
            year: yearNum,
            vin,
            licensePlate,
            image: req.file ? req.file.location : null
        });

        await car.save();

        res.status(201).json(car);
    } catch (err) {
        errorHandler(res, err, 'Failed to add car');
    }
};

// Update a car
export const updateCar = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { make, model, year, vin, licensePlate } = req.body;
        
        // Find car and check ownership
        let car = await Car.findById(req.params.id);
        
        if (!car) {
            return res.status(404).json({
                errors: [{ msg: 'Car not found' }]
            });
        }

        // Make sure user owns car
        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({
                errors: [{ msg: 'Not authorized to update this car' }]
            });
        }

        // If there's a new image and an old image exists, delete the old one
        if (req.file && car.image) {
            await deleteS3Object(car.image);
        }

        // Update fields
        car.make = make;
        car.model = model;
        car.year = parseInt(year, 10);
        car.vin = vin;
        car.licensePlate = licensePlate;
        
        // Update image if new one is uploaded
        if (req.file) {
            car.image = req.file.location;
        }

        await car.save();

        res.json(car);
    } catch (err) {
        errorHandler(res, err, 'Failed to update car');
    }
};

// Delete a car
export const deleteCar = async (req, res) => {
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
                errors: [{ msg: 'Not authorized to delete this car' }]
            });
        }

        // Delete the car's image from S3 if it exists
        if (car.image) {
            await deleteS3Object(car.image);
        }

        await car.deleteOne();

        res.json({ msg: 'Car removed' });
    } catch (err) {
        errorHandler(res, err, 'Failed to delete car');
    }
}; 