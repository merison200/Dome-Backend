import Hall from '../models/hall.js';
import { uploadImage, deleteImage } from '../utils/cloudinaryUtils.js';

//Create Hall
export const createHall = async (req, res) => {
  try {

    const {
      name,
      description,
      capacity,
      basePrice,
      additionalHourPrice,
      features,
      amenities,
      location,
      size,
      rating,
      reviews,
      imageLabels = [],
    } = req.body;

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: 'Images are required' });

    const images = await Promise.all(
      files.map(async (file, index) => {
        const uploadResult = await uploadImage(file, 'halls');
        if (!uploadResult.success) throw new Error(uploadResult.error);
        return {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          label: imageLabels[index] || `Image ${index + 1}`
        };
      })
    );

    const hall = new Hall({
      name,
      description,
      capacity,
      basePrice,
      additionalHourPrice,
      features,
      amenities,
      location,
      size,
      rating: Number(rating) || 0,
      reviews: Number(reviews) || 0,
      images
    });

    await hall.save();
    console.log('Hall created:', hall);
    res.status(201).json(hall);
  } catch (error) {
    console.error('Create hall error:', error);
    res.status(500).json({ message: error.message });
  }
};

//Get All Halls
export const getHalls = async (req, res) => {
  try {
    const halls = await Hall.find().sort({ createdAt: -1 });
    console.log('Fetched halls:', halls.length);
    res.json(halls);
  } catch (error) {
    console.error('Get halls error:', error);
    res.status(500).json({ message: error.message });
  }
};

//Get Halls By ID
export const getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    console.log('Fetched hall:', hall._id);
    res.json(hall);
  } catch (error) {
    console.error('Get hall error:', error);
    res.status(500).json({ message: error.message });
  }
};

//Update Hall
export const updateHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });

    const {
      name,
      description,
      capacity,
      basePrice,
      additionalHourPrice,
      features,
      amenities,
      location,
      size,
      rating,
      reviews,
      imageLabels = []
    } = req.body;

    const files = req.files || [];
    let updatedImages = hall.images;

    if (files.length > 0) {
      await Promise.all(
        updatedImages.map(async img => {
          if (img.publicId) await deleteImage(img.publicId);
        })
      );

      updatedImages = await Promise.all(
        files.map(async (file, index) => {
          const uploadResult = await uploadImage(file, 'halls');
          if (!uploadResult.success) throw new Error(uploadResult.error);
          return {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            label: imageLabels[index] || `Image ${index + 1}`
          };
        })
      );
    }

    hall.name = name || hall.name;
    hall.description = description || hall.description;
    hall.capacity = capacity || hall.capacity;
    hall.basePrice = basePrice || hall.basePrice;
    hall.additionalHourPrice = additionalHourPrice || hall.additionalHourPrice;
    hall.features = features || hall.features;
    hall.amenities = amenities || hall.amenities;
    hall.location = location || hall.location;
    hall.size = size || hall.size;
    hall.rating = rating !== undefined ? Number(rating) : hall.rating;
    hall.reviews = reviews !== undefined ? Number(reviews) : hall.reviews;
    hall.images = updatedImages;

    await hall.save();
    console.log('Hall updated:', hall._id);
    res.json(hall);
  } catch (error) {
    console.error('Update hall error:', error);
    res.status(500).json({ message: error.message });
  }
};

//Delete Hall
export const deleteHall = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) return res.status(404).json({ message: 'Hall not found' });

    console.log('Deleting hall and images:', hall._id);

    await Promise.all(
      hall.images.map(async img => {
        if (img.publicId) await deleteImage(img.publicId);
      })
    );

    await hall.deleteOne();
    console.log('Hall deleted');
    res.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    console.error('Delete hall error:', error);
    res.status(500).json({ message: error.message });
  }
};
