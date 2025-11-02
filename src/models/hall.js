import mongoose from 'mongoose';

const hallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'halls'
    },
    description: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    additionalHourPrice: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        label: { type: String }
      }
    ],
    features: [String],
    amenities: [String],
    location: {
      type: String,
      required: true,
    },
    size: {
      type: String
    }
  },
  { timestamps: true }
);

const Hall = mongoose.model('Hall', hallSchema);
export default Hall;
