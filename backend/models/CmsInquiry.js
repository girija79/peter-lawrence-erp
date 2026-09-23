const mongoose = require("mongoose");

const cmsInquirySchema = new mongoose.Schema(
  {
    inquiryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    inquiryType: {
      type: String,
      enum: [
        "General Inquiry",
        "Legal Consultation",
        "Corporate Services",
        "Case Inquiry",
        "Career",
        "Other",
      ],
      default: "General Inquiry",
    },

    status: {
      type: String,
      enum: [
        "New",
        "In Progress",
        "Resolved",
        "Closed",
      ],
      default: "New",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CmsInquiry", cmsInquirySchema);