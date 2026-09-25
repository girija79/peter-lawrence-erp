const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentName: {
      type: String,
      required: true,
      trim: true
    },

    documentCategory: {
      type: String,
      enum: [
        'Legal',
        'Client',
        'Case',
        'HR',
        'Employee',
        'Finance',
        'Identity',
        'Other'
      ],
      default: 'Other'
    },

    documentType: {
      type: String,
      enum: [
        'Agreement',
        'Contract',
        'Employment Contract',
        'Offer Letter',
        'Appointment Letter',
        'Identity Document',
        'Qualification Certificate',
        'Experience Certificate',
        'Salary Document',
        'Policy Document',
        'Court Document',
        'Evidence',
        'Invoice',
        'Case Document',
        'HR Document',
        'Other'
      ],
      default: 'Other'
    },

    // Client ownership
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null
    },

    // Employee / HR ownership
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },

    // Legal case relationship
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null
    },

    // User who uploaded/created the document
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    fileName: {
      type: String,
      default: '',
      trim: true
    },

    fileUrl: {
      type: String,
      default: '',
      trim: true
    },

    description: {
      type: String,
      default: '',
      trim: true
    },

    status: {
      type: String,
      enum: [
        'Active',
        'Archived'
      ],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);


// Performance indexes
documentSchema.index({
  employeeId: 1,
  createdAt: -1
});

documentSchema.index({
  clientId: 1,
  createdAt: -1
});

documentSchema.index({
  caseId: 1,
  createdAt: -1
});

documentSchema.index({
  documentCategory: 1,
  status: 1
});


module.exports = mongoose.model(
  'Document',
  documentSchema
);