const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true
    },

    category: {
      type: String,
      enum: [
        'Corporate',
        'Criminal',
        'Civil',
        'Family',
        'Property',
        'Employment',
        'Commercial',
        'Other'
      ],
      default: 'Other'
    },

    description: {
      type: String,
      default: ''
    },

    court: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: [
        'New',
        'Active',
        'Pending',
        'Closed',
        'Won',
        'Lost'
      ],
      default: 'New'
    },

    filingDate: {
      type: Date
    },

    nextHearingDate: {
      type: Date
    },

    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Case', caseSchema);