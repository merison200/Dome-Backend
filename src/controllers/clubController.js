import Event from '../models/club.js';
import { uploadImage, deleteImage, extractPublicId } from '../utils/cloudinaryUtils.js';

// CREATE - Add new event
export const createEvent = async (req, res) => {
  try {
    const { name, description, date, time, dj, hypeman, labels } = req.body;
    const images = req.files;

    // Validate required fields
    if (!name || !description || !date || !time || !labels) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Parse arrays
    const djArray = Array.isArray(dj) ? dj : (dj ? JSON.parse(dj) : []);
    const hypemanArray = Array.isArray(hypeman) ? hypeman : (hypeman ? JSON.parse(hypeman) : []);
    const labelsArray = Array.isArray(labels) ? labels : JSON.parse(labels);

    // Upload images
    const imageUrls = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const uploadResult = await uploadImage(image, 'events');
        if (uploadResult.success) {
          imageUrls.push(uploadResult.url);
        }
      }
    }

    // Create new event
    const newEvent = new Event({
      name,
      description,
      date,
      time,
      dj: djArray,
      hypeman: hypemanArray,
      images: imageUrls,
      labels: labelsArray
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: savedEvent
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// READ - Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { sortBy = 'date', sortOrder = 'asc' } = req.query;
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find().sort({ [sortBy]: sortDirection });

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events
    });

  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// READ - Get event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event
    });

  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// UPDATE - Update event by ID
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, date, time, dj, hypeman, labels, keepExistingImages } = req.body;
    const newImages = req.files;

    // Find existing event
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (time) updateData.time = time;

    // Handle arrays
    if (dj !== undefined) {
      updateData.dj = Array.isArray(dj) ? dj : (dj ? JSON.parse(dj) : []);
    }
    if (hypeman !== undefined) {
      updateData.hypeman = Array.isArray(hypeman) ? hypeman : (hypeman ? JSON.parse(hypeman) : []);
    }
    if (labels !== undefined) {
      updateData.labels = Array.isArray(labels) ? labels : JSON.parse(labels);
    }

    // Handle images
    let finalImageUrls = [];

    if (keepExistingImages === 'true') {
      finalImageUrls = [...existingEvent.images];
    } else {
      // Delete old images
      for (const imageUrl of existingEvent.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
    }

    // Upload new images
    if (newImages && newImages.length > 0) {
      for (const image of newImages) {
        const uploadResult = await uploadImage(image, 'events');
        if (uploadResult.success) {
          finalImageUrls.push(uploadResult.url);
        }
      }
    }

    if (finalImageUrls.length > 0) {
      updateData.images = finalImageUrls;
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// DELETE - Delete event by ID
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Delete images from Cloudinary
    for (const imageUrl of event.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    // Delete event from database
    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};