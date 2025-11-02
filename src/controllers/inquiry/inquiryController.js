// import Inquiry from "../../models/inquiry.js";

// // @desc    Create new inquiry
// // @route   POST /api/inquiries
// // @access  Public
// export const createInquiry = async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     if (!name || !email || !message) {
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     const inquiry = new Inquiry({ name, email, message });
//     await inquiry.save();

//     res.status(201).json({
//       success: true,
//       message: "Inquiry received. We'll get back to you soon!",
//       inquiry,
//     });
//   } catch (error) {
//     console.error("Error creating inquiry:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // @desc    Get all inquiries (Admin only)
// // @route   GET /api/inquiries
// // @access  Private/Admin
// export const getInquiries = async (req, res) => {
//   try {
//     const inquiries = await Inquiry.find().sort({ createdAt: -1 });
//     res.json({ success: true, count: inquiries.length, inquiries });
//   } catch (error) {
//     console.error("Error fetching inquiries:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // @desc    Get single inquiry by ID (Admin only)
// // @route   GET /api/inquiries/:id
// // @access  Private/Admin
// export const getInquiryById = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findById(req.params.id);
//     if (!inquiry) {
//       return res.status(404).json({ success: false, message: "Inquiry not found" });
//     }
//     res.json({ success: true, inquiry });
//   } catch (error) {
//     console.error("Error fetching inquiry:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // @desc    Delete inquiry (Admin only)
// // @route   DELETE /api/inquiries/:id
// // @access  Private/Admin
// export const deleteInquiry = async (req, res) => {
//   try {
//     const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
//     if (!inquiry) {
//       return res.status(404).json({ success: false, message: "Inquiry not found" });
//     }
//     res.json({ success: true, message: "Inquiry deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting inquiry:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


import Inquiry from "../../models/inquiry.js";
import { sendInquiryReply, sendInquiryConfirmation } from "../../utils/inquiryEmail.js";

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Public
export const createInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const inquiry = new Inquiry({ name, email, message });
    await inquiry.save();

    // Send confirmation email to customer
    try {
      await sendInquiryConfirmation(email, { name });
    } catch (emailError) {
      console.error('Failed to send inquiry confirmation email:', emailError);
      // Don't fail the inquiry creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Inquiry received. We'll get back to you soon!",
      inquiry,
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all inquiries (Admin only)
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get single inquiry by ID (Admin only)
// @route   GET /api/inquiries/:id
// @access  Private/Admin
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, inquiry });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Reply to inquiry (Admin only)
// @route   POST /api/inquiries/:id/reply
// @access  Private/Admin
export const replyToInquiry = async (req, res) => {
  try {
    const { subject, message, repliedBy } = req.body;
    const inquiryId = req.params.id;

    // Validation
    if (!subject || !message || !repliedBy) {
      return res.status(400).json({ 
        success: false, 
        message: "Subject, message, and repliedBy are required" 
      });
    }

    // Find the inquiry
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    // Create reply object
    const reply = {
      subject: subject.trim(),
      message: message.trim(),
      repliedBy: repliedBy.trim(),
      repliedAt: new Date()
    };

    // Update inquiry with reply
    inquiry.replies.push(reply);
    inquiry.status = 'replied';
    inquiry.lastRepliedAt = new Date();
    inquiry.lastRepliedBy = repliedBy.trim();
    
    await inquiry.save();

    // Send reply email to customer
    try {
      await sendInquiryReply(inquiry.email, {
        customerName: inquiry.name,
        originalMessage: inquiry.message,
        replySubject: subject,
        replyMessage: message,
        repliedBy: repliedBy,
        inquiryDate: inquiry.createdAt
      });
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError);
      
      // Remove the reply from database if email fails
      inquiry.replies.pop();
      inquiry.status = 'pending';
      inquiry.lastRepliedAt = inquiry.replies.length > 0 ? inquiry.replies[inquiry.replies.length - 1].repliedAt : null;
      inquiry.lastRepliedBy = inquiry.replies.length > 0 ? inquiry.replies[inquiry.replies.length - 1].repliedBy : null;
      await inquiry.save();
      
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send reply email. Please try again." 
      });
    }

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      inquiry: {
        ...inquiry.toObject(),
        latestReply: reply
      }
    });

  } catch (error) {
    console.error("Error replying to inquiry:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update inquiry status (Admin only)
// @route   PUT /api/inquiries/:id/status
// @access  Private/Admin
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'replied', 'closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid status is required (pending, replied, closed)" 
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.json({ 
      success: true, 
      message: "Inquiry status updated successfully", 
      inquiry 
    });
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete inquiry (Admin only)
// @route   DELETE /api/inquiries/:id
// @access  Private/Admin
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};