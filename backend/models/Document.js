const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentName: {
      type: String,
      required: true,
      trim: true
    },

    documentType: {
      type: String,
      enum: [
        'Agreement',
        'Contract',
        'Court Document',
        'Evidence',
        'Invoice',
        'Identity Document',
        'Other'
      ],
      default: 'Other'
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },

    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null
    },

    fileName: {
      type: String,
      default: ''
    },

    fileUrl: {
      type: String,
      default: ''
    },

    description: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Document', documentSchema);