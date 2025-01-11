import Document from '../models/documentModel.js';
import { validationResult } from 'express-validator';
import { errorHandler } from '../utils/errorHandler.js';
import { deleteS3Object } from '../config/aws.js';

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
        
        if (!req.file) {
            return res.status(400).json({
                errors: [{ msg: 'Please upload a file' }]
            });
        }

        const document = new Document({
            user: req.user.id,
            car: carId,
            type,
            title,
            description,
            expiryDate,
            fileUrl: req.file.location,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

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

        const { type, title, description, expiryDate } = req.body;
        
        let document = await Document.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({
                errors: [{ msg: 'Document not found' }]
            });
        }

        // Check document ownership
        if (document.user.toString() !== req.user.id) {
            return res.status(401).json({
                errors: [{ msg: 'Not authorized to update this document' }]
            });
        }

        // If there's a new file and an old file exists, delete the old one
        if (req.file && document.fileUrl) {
            await deleteS3Object(document.fileUrl);
        }

        // Update fields
        document.type = type;
        document.title = title;
        document.description = description;
        document.expiryDate = expiryDate;
        
        // Update file information if new file is uploaded
        if (req.file) {
            document.fileUrl = req.file.location;
            document.fileName = req.file.originalname;
            document.fileType = req.file.mimetype;
            document.fileSize = req.file.size;
        }

        await document.save();

        res.json(document);
    } catch (err) {
        errorHandler(res, err, 'Failed to update document');
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