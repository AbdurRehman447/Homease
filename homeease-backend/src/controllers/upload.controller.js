import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import prisma from '../config/database.js';
import { successResponse } from '../utils/responseHandler.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import fs from 'fs';
import { promisify } from 'util';

const unlinkFile = promisify(fs.unlink);

// Upload provider avatar
export const uploadProviderAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  if (!req.file) {
    throw createError.badRequest('No file uploaded');
  }

  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'homeease/avatars');

    // Update provider record
    const provider = await prisma.provider.update({
      where: { id: userId },
      data: { avatar: uploadResult.url },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    // Delete temporary file
    await unlinkFile(req.file.path);

    return successResponse(res, 'Avatar uploaded successfully', {
      provider,
      image: uploadResult,
    });
  } catch (error) {
    // Clean up temporary file on error
    if (req.file) {
      await unlinkFile(req.file.path).catch(() => {});
    }
    throw error;
  }
});

// Upload provider cover image
export const uploadProviderCoverImage = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  if (!req.file) {
    throw createError.badRequest('No file uploaded');
  }

  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'homeease/covers');

    // Update provider record
    const provider = await prisma.provider.update({
      where: { id: userId },
      data: { coverImage: uploadResult.url },
      select: {
        id: true,
        name: true,
        coverImage: true,
      },
    });

    // Delete temporary file
    await unlinkFile(req.file.path);

    return successResponse(res, 'Cover image uploaded successfully', {
      provider,
      image: uploadResult,
    });
  } catch (error) {
    // Clean up temporary file on error
    if (req.file) {
      await unlinkFile(req.file.path).catch(() => {});
    }
    throw error;
  }
});

// Upload provider documents (CNIC, certificates)
export const uploadProviderDocuments = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { documentType } = req.body; // 'cnic', 'certificate', 'license'

  if (!req.files || req.files.length === 0) {
    throw createError.badRequest('No files uploaded');
  }

  try {
    // Upload all documents to Cloudinary
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file, 'homeease/documents')
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Get current provider documents
    const provider = await prisma.provider.findUnique({
      where: { id: userId },
      select: { documents: true },
    });

    // Update documents JSON
    const currentDocs = provider.documents || {};
    const updatedDocs = {
      ...currentDocs,
      [documentType]: uploadResults.map((result) => ({
        url: result.url,
        publicId: result.publicId,
        uploadedAt: new Date().toISOString(),
      })),
    };

    // Update provider record
    await prisma.provider.update({
      where: { id: userId },
      data: { documents: updatedDocs },
    });

    // Delete temporary files
    await Promise.all(req.files.map((file) => unlinkFile(file.path)));

    return successResponse(res, 'Documents uploaded successfully', {
      documentType,
      uploaded: uploadResults.length,
      documents: uploadResults,
    });
  } catch (error) {
    // Clean up temporary files on error
    if (req.files) {
      await Promise.all(req.files.map((file) => unlinkFile(file.path).catch(() => {})));
    }
    throw error;
  }
});

// Upload user avatar (for customers)
export const uploadUserAvatar = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  if (!req.file) {
    throw createError.badRequest('No file uploaded');
  }

  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'homeease/avatars');

    // Update user record
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.url },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    // Delete temporary file
    await unlinkFile(req.file.path);

    return successResponse(res, 'Avatar uploaded successfully', {
      user,
      image: uploadResult,
    });
  } catch (error) {
    // Clean up temporary file on error
    if (req.file) {
      await unlinkFile(req.file.path).catch(() => {});
    }
    throw error;
  }
});

// Generic image upload (for testing/admin)
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createError.badRequest('No file uploaded');
  }

  try {
    const uploadResult = await uploadToCloudinary(req.file, 'homeease/general');

    // Delete temporary file
    await unlinkFile(req.file.path);

    return successResponse(res, 'Image uploaded successfully', uploadResult);
  } catch (error) {
    // Clean up temporary file on error
    if (req.file) {
      await unlinkFile(req.file.path).catch(() => {});
    }
    throw error;
  }
});

export default {
  uploadProviderAvatar,
  uploadProviderCoverImage,
  uploadProviderDocuments,
  uploadUserAvatar,
  uploadImage,
};
