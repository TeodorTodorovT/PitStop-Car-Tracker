import Car from '../models/carModel.js';
import { validationResult } from 'express-validator';
import { errorHandler } from '../utils/errorHandler.js';

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