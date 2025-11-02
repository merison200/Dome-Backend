import { cloudinary } from '../config/cloudinary.js';

//Upload image
export const uploadImage = async (imageInput, folder, publicId = null) => {
  try {
    if (!folder) throw new Error('Cloudinary folder is required');

    const uploadOptions = {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    let uploadSource;

    if (typeof imageInput === 'string') {
      uploadSource = imageInput;
    } else if (Buffer.isBuffer(imageInput)) {
      const b64 = imageInput.toString('base64');
      uploadSource = `data:image/jpeg;base64,${b64}`;
    } else if (imageInput?.buffer) {
      const b64 = Buffer.from(imageInput.buffer).toString('base64');
      const mimeType = imageInput.mimetype || 'image/jpeg';
      uploadSource = `data:${mimeType};base64,${b64}`;
    } else {
      throw new Error('Invalid image input type');
    }

    const result = await cloudinary.uploader.upload(uploadSource, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: error.message };
  }
};

//Update Image
export const updateImage = async (oldPublicId, newImageInput, folder) => {
  try {
    if (!folder) throw new Error('Cloudinary folder is required');

    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    return await uploadImage(newImageInput, folder);
  } catch (error) {
    console.error('Cloudinary update error:', error);
    return { success: false, error: error.message };
  }
};

//Delete Image
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

//Extract PublicID
export const extractPublicId = (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl?.includes('cloudinary.com')) return null;

    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');

    if (uploadIndex === -1) return null;

    let publicIdParts = urlParts.slice(uploadIndex + 1);
    if (/^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    const publicIdWithExtension = publicIdParts.join('/');
    return publicIdWithExtension.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};