import Document from '../models/documentModel.js';
import { validationResult } from 'express-validator';
import { errorHandler } from '../utils/errorHandler.js';
import { deleteS3Object } from '../config/aws.js';
import s3 from '../config/aws.js';

// Add a new document
export const addDocument = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { type, title, description, carId, expiryDate } = req.body;
        
        // Create document object with required fields
        const documentData = {
            user: req.user.id,
            car: carId,
            type,
            title,
            description,
            expiryDate
        };

        // Add file information if a file was uploaded
        if (req.file) {
            documentData.fileUrl = req.file.location;
            documentData.fileName = req.file.originalname;
            documentData.fileType = req.file.mimetype;
            documentData.fileSize = req.file.size;
        }

        const document = new Document(documentData);
        await document.save();

        res.status(201).json(document);
    } catch (err) {
        errorHandler(res, err, 'Failed to add document');
    }
};

// Get all documents for a car
export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ 
            car: req.params.carId,
            user: req.user.id 
        }).sort({ createdAt: -1 });
        
        res.json(documents);
    } catch (err) {
        errorHandler(res, err, 'Failed to fetch documents');
    }
};

// Get a single document
export const getDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({
                errors: [{ msg: 'Document not found' }]
            });
        }

        // Check document ownership
        if (document.user.toString() !== req.user.id) {
            return res.status(401).json({
                errors: [{ msg: 'Not authorized to access this document' }]
            });
        }

        res.json(document);
    } catch (err) {
        errorHandler(res, err, 'Failed to fetch document');
    }
};

// Update a document
export const updateDocument = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { carId } = req.body;

        if (!carId) {
            return res.status(400).json({
                errors: [{ msg: 'Car ID is required' }]
            });
        }

        // Find the document and check ownership
        const document = await Document.findOne({
            _id: id,
            user: req.user.id,
            car: carId
        });

        if (!document) {
            return res.status(404).json({
                errors: [{ msg: 'Document not found' }]
            });
        }

        // Handle file removal if requested
        if (req.body.removeFile === 'true' && document.fileUrl) {
            // Delete the file from S3
            const key = document.fileUrl.split('/').pop();
            await s3.deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key
            }).promise();

            // Clear file-related fields
            document.fileUrl = undefined;
            document.fileName = undefined;
            document.fileType = undefined;
            document.fileSize = undefined;
        }

        // Handle new file upload if provided
        if (req.file) {
            // If there's an existing file, delete it first
            if (document.fileUrl) {
                const key = document.fileUrl.split('/').pop();
                await s3.deleteObject({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key
                }).promise();
            }

            // Update with new file information
            document.fileUrl = req.file.location;
            document.fileName = req.file.originalname;
            document.fileType = req.file.mimetype;
            document.fileSize = req.file.size;
        }

        // Update other fields
        document.title = req.body.title;
        document.type = req.body.type;
        document.description = req.body.description;
        document.expiryDate = req.body.expiryDate || null;

        await document.save();

        res.json(document);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({
            errors: [{ msg: 'Server error while updating document' }]
        });
    }
};

// Delete a document
export const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({
                errors: [{ msg: 'Document not found' }]
            });
        }

        // Check document ownership
        if (document.user.toString() !== req.user.id) {
            return res.status(401).json({
                errors: [{ msg: 'Not authorized to delete this document' }]
            });
        }

        // Delete the document's file from S3
        if (document.fileUrl) {
            await deleteS3Object(document.fileUrl);
        }

        await document.deleteOne();

        res.json({ msg: 'Document removed' });
    } catch (err) {
        errorHandler(res, err, 'Failed to delete document');
    }
}; 