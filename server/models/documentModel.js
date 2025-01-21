import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['insurance', 'registration', 'tax', 'other']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  fileUrl: {
    type: String,
    required: false
  },
  fileName: {
    type: String,
    required: false
  },
  fileType: {
    type: String,
    required: false
  },
  fileSize: {
    type: Number,
    required: false
  },
  expiryDate: {
    type: Date
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
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Document = mongoose.model('Document', documentSchema);

export default Document; 