import mongoose from "mongoose";

const loungeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lounge name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Lounge description is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: "At least one image is required"
      }
    },
    labels: {
      type: [String],
      required: [true, "At least one label is required"],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: "At least one label is required"
      }
    },
  },
  { timestamps: true }
);

const Lounge = mongoose.model("Lounge", loungeSchema);

export default Lounge;