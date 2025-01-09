import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    make: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30
    },
    model: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 30
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    vin: {
        type: String,
        trim: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return !v || (v.length === 17 && /^[A-HJ-NPR-Z0-9]+$/.test(v));
            },
            message: 'Invalid VIN format'
        }
    },
    licensePlate: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 10,
        validate: {
            validator: function(v) {
                return /^[A-Z0-9 -]+$/i.test(v);
            },
            message: 'License plate can only contain letters, numbers, spaces, and hyphens'
        }
    },
    image: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
carSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Car = mongoose.model('Car', carSchema);

export default Car; 