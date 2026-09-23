const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    reportType: {
      type: String,
      enum: [
        'Case Report',
        'Client Report',
        'Revenue Report',
        'Payroll Report',
        'Employee Report',
        'Vendor Report',
        'Petty Cash Report',
        'Recruitment Report',
        'Performance Report',
        'Comprehensive Report'
      ],
      required: true
    },

    reportTitle: {
      type: String,
      required: true,
      trim: true
    },

    periodFrom: {
      type: Date,
      default: null
    },

    periodTo: {
      type: Date,
      default: null
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    summary: {
      type: String,
      default: '',
      trim: true
    },

    reportData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    status: {
      type: String,
      enum: ['Generated', 'Archived'],
      default: 'Generated'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);