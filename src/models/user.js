import mongoose from "mongoose";
import { createNotification } from "../utils/userNotification.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "customer"],
      default: "customer",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


// ✅ FIXED: After user is created (registration)
userSchema.post("save", async function (doc, next) {
  try {
    if (doc.isNew) {
      await createNotification(
        doc._id,
        "Welcome to Dome!",
        "Your account has been created successfully.",
        "success"
      );
    }
  } catch (error) {
    console.error("User registration notification failed:", error.message);
  }
  // next(); // Not needed for post hooks
});

// ✅ FIXED: Better approach for password change notifications
// Use instance method instead of findOneAndUpdate hook
userSchema.methods.createPasswordChangeNotification = async function() {
  try {
    await createNotification(
      this._id,
      "Password Updated",
      "Your account password has been changed successfully.",
      "info"
    );
  } catch (error) {
    console.error("Password change notification failed:", error.message);
  }
};

// ✅ ADD: Pre-save hook to detect password changes
userSchema.pre('save', function(next) {
  if (this.isModified('password') && !this.isNew) {
    this._passwordChanged = true;
  }
  next();
});

// ✅ ADD: Post-save hook for password changes
userSchema.post('save', async function(doc, next) {
  if (this._passwordChanged) {
    try {
      await doc.createPasswordChangeNotification();
    } catch (error) {
      console.error("Password change notification failed:", error.message);
    }
    delete this._passwordChanged;
  }
});

const User = mongoose.model("User", userSchema);
export default User;