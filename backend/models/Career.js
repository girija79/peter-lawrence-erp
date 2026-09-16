const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    jobTitle: {
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

    employmentType: {
      type: String,
      enum: [
        'Full-Time',
        'Part-Time',
        'Contract',
        'Intern'
      ],
      default: 'Full-Time'
    },

    location: {
      type: String,
      default: 'Belgrade, Serbia',
      trim: true
    },

    description: {
      type: String,
      default: '',
      trim: true
    },

    requirements: {
      type: String,
      default: '',
      trim: true
    },

    salaryRange: {
      type: String,
      default: '',
      trim: true
    },

    openingDate: {
      type: Date,
      required: true
    },

    closingDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: [
        'Draft',
        'Open',
        'Closed',
        'On Hold'
      ],
      default: 'Draft'
    },

    vacancies: {
      type: Number,
      min: 1,
      default: 1
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

module.exports = mongoose.model('Career', careerSchema);