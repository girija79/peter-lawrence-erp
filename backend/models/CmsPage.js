const mongoose = require("mongoose");

const cmsPageSchema = new mongoose.Schema(
  {
    pageTitle: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    pageType: {
      type: String,
      enum: [
        "About",
        "Services",
        "Contact",
        "Privacy Policy",
        "Terms & Conditions",
        "Other",
      ],
      default: "Other",
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CmsPage", cmsPageSchema);