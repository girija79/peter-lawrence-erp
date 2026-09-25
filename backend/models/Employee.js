const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      unique: true,
      sparse: true
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

    designation: {
      type: String,
      required: true,
      trim: true
    },

    joiningDate: {
      type: Date,
      required: true
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

    reportingManager: {
      type: String,
      default: '',
      trim: true
    },

    address: {
      type: String,
      default: '',
      trim: true
    },

    salary: {
      type: Number,
      min: 0,
      default: 0
    },

    status: {
      type: String,
      enum: [
        'Active',
        'On Leave',
        'Resigned',
        'Terminated'
      ],
      default: 'Active'
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

module.exports = mongoose.model('Employee', employeeSchema);