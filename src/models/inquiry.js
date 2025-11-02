// import mongoose from "mongoose";

// const inquirySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
//     },
//     message: {
//       type: String,
//       required: [true, "Message is required"],
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// const Inquiry = mongoose.model("Inquiry", inquirySchema);

// export default Inquiry;

import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'closed'],
      default: 'pending'
    },
    replies: [{
      subject: {
        type: String,
        required: true,
        trim: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      repliedBy: {
        type: String,
        required: true,
        trim: true
      },
      repliedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastRepliedAt: {
      type: Date
    },
    lastRepliedBy: {
      type: String
    }
  },
  { timestamps: true }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;