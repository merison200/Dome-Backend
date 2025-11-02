import Lounge from '../models/lounge.js';
import { uploadImage, deleteImage, extractPublicId } from '../utils/cloudinaryUtils.js';

// CREATE - Add new lounge
export const createLounge = async (req, res) => {
  try {
    const { name, description, date, time, labels } = req.body;
    const images = req.files;

    // Validate required fields
    if (!name || !description || !date || !time || !labels) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate images
    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    // Parse arrays if they come as strings
    const labelsArray = Array.isArray(labels) ? labels : JSON.parse(labels);
    
    // Validate labels array
    if (!labelsArray || labelsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one label is required'
      });
    }

    // Upload images and get URLs as simple strings
    const imageUrls = [];
    for (const image of images) {
      const uploadResult = await uploadImage(image, 'lounges');
      if (uploadResult.success) {
        imageUrls.push(uploadResult.url);
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image',
          error: uploadResult.error
        });
      }
    }

    // Ensure at least one image was successfully uploaded
    if (imageUrls.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No images were successfully uploaded'
      });
    }

    // Create new lounge
    const newLounge = new Lounge({
      name,
      description,
      date,
      time,
      images: imageUrls,
      labels: labelsArray
    });

    const savedLounge = await newLounge.save();

    res.status(201).json({
      success: true,
      message: 'Lounge created successfully',
      data: savedLounge
    });

  } catch (error) {
    console.error('Create lounge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// READ - Get all lounges
export const getAllLounges = async (req, res) => {
  try {
    const { sortBy = 'date', sortOrder = 'asc' } = req.query;
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const lounges = await Lounge.find().sort({ [sortBy]: sortDirection });

    res.status(200).json({
      success: true,
      message: 'Lounges retrieved successfully',
      data: lounges
    });

  } catch (error) {
    console.error('Get all lounges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// READ - Get lounge by ID
export const getLoungeById = async (req, res) => {
  try {
    const { id } = req.params;

    const lounge = await Lounge.findById(id);

    if (!lounge) {
      return res.status(404).json({
        success: false,
        message: 'Lounge not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lounge retrieved successfully',
      data: lounge
    });

  } catch (error) {
    console.error('Get lounge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// UPDATE - Update lounge by ID
export const updateLounge = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, date, time, labels, keepExistingImages } = req.body;
    const newImages = req.files;

    // Find existing lounge
    const existingLounge = await Lounge.findById(id);
    if (!existingLounge) {
      return res.status(404).json({
        success: false,
        message: 'Lounge not found'
      });
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (date) updateData.date = date; // Store as string
    if (time) updateData.time = time;
    if (labels !== undefined) {
      updateData.labels = Array.isArray(labels) ? labels : JSON.parse(labels);
    }

    // Handle images
    let finalImageUrls = [];

    if (keepExistingImages === 'true') {
      finalImageUrls = [...existingLounge.images];
    } else {
      // Delete old images
      for (const imageUrl of existingLounge.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
    }

    // Upload new images
    if (newImages && newImages.length > 0) {
      for (const image of newImages) {
        const uploadResult = await uploadImage(image, 'lounges');
        if (uploadResult.success) {
          finalImageUrls.push(uploadResult.url);
        } else {
          // If upload fails, log error but don't fail the entire update
          console.error('Failed to upload image:', uploadResult.error);
        }
      }
    }

    // Ensure we have at least one image after the update
    if (finalImageUrls.length === 0 && (keepExistingImages !== 'true' || existingLounge.images.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required. Upload failed or no existing images to keep.'
      });
    }

    if (finalImageUrls.length > 0) {
      updateData.images = finalImageUrls;
    }

    // Update lounge
    const updatedLounge = await Lounge.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Lounge updated successfully',
      data: updatedLounge
    });

  } catch (error) {
    console.error('Update lounge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// DELETE - Delete lounge by ID
export const deleteLounge = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the lounge
    const lounge = await Lounge.findById(id);
    if (!lounge) {
      return res.status(404).json({
        success: false,
        message: 'Lounge not found'
      });
    }

    // Delete images from Cloudinary
    for (const imageUrl of lounge.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    // Delete lounge from database
    await Lounge.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Lounge deleted successfully'
    });

  } catch (error) {
    console.error('Delete lounge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};