import multer from 'multer';
import path from 'path';
import { createError } from '../utils/ApiError.js';
import config from '../config/config.js';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp'); // Temporary storage before Cloudinary upload
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for image uploads
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError.badRequest('Only image files (JPEG, PNG, JPG, WEBP) are allowed'), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      createError.badRequest('Only image files and PDFs are allowed for documents'),
      false
    );
  }
};

// Upload configurations
export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: config.fileUpload.maxSize, // 5MB
  },
}).single('image');

export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: config.fileUpload.maxSize,
  },
}).array('images', 5); // Max 5 images

export const uploadDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: config.fileUpload.maxSize * 2, // 10MB for documents
  },
}).single('document');

export const uploadMultipleDocuments = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: config.fileUpload.maxSize * 2,
  },
}).array('documents', 3); // Max 3 documents

// Upload provider profile images
export const uploadProviderImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: config.fileUpload.maxSize,
  },
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size is too large. Maximum size is 5MB for images and 10MB for documents',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files uploaded',
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
  next(err);
};

export default {
  uploadImage,
  uploadMultipleImages,
  uploadDocument,
  uploadMultipleDocuments,
  uploadProviderImages,
  handleMulterError,
};
