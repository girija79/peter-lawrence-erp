const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    candidateId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      default: '',
      trim: true
    },

    positionApplied: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      enum: [
        'Administration',
        'Finance',
        'Human Resources',
        'Legal Support',
        'IT',
        'Operations',
        'Other'
      ],
      default: 'Operations'
    },

    applicationDate: {
      type: Date,
      required: true
    },

    experience: {
      type: Number,
      min: 0,
      default: 0
    },

    qualification: {
      type: String,
      default: '',
      trim: true
    },

    resumeUrl: {
      type: String,
      default : '',
      trim: true
    },

    interviewDate: {
      type: Date,
      default: null
    },

    interviewStatus: {
      type: String,
      enum: [
        'Not Scheduled',
        'Scheduled',
        'Completed',
        'Cancelled'
      ],
      default: 'Not Scheduled'
    },

    status: {
      type: String,
      enum: [
        'Applied',
        'Shortlisted',
        'Interview',
        'Selected',
        'Rejected',
        'Hired'
      ],
      default: 'Applied'
    },

    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Candidate', candidateSchema);