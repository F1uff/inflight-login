const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const driverDocsDir = path.join(uploadsDir, 'driver-documents');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(driverDocsDir)) {
    fs.mkdirSync(driverDocsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, driverDocsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-original-name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
    // Check if file type is allowed
    const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Please upload JPG, PNG, PDF, or DOC files.`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per request
    }
});

// Middleware for driver document uploads
const uploadDriverDocuments = upload.fields([
    { name: 'driverLicense', maxCount: 1 },
    { name: 'ndaDocument', maxCount: 1 },
    { name: 'additionalDocuments', maxCount: 3 }
]);

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: 'File size exceeds 10MB limit',
                    field: error.field
                }
            });
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TOO_MANY_FILES',
                    message: 'Too many files uploaded',
                    field: error.field
                }
            });
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'UNEXPECTED_FIELD',
                    message: 'Unexpected field in upload',
                    field: error.field
                }
            });
        }
    } else if (error.message.includes('File type')) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_FILE_TYPE',
                message: error.message
            }
        });
    }
    
    next(error);
};

module.exports = {
    uploadDriverDocuments,
    handleMulterError,
    upload
}; 