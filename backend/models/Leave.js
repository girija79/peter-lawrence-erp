const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    leaveType: {
      type: String,
      enum: [
        'Casual Leave',
        'Sick Leave',
        'Annual Leave',
        'Emergency Leave',
        'Other'
      ],
      default: 'Casual Leave'
    },

    fromDate: {
      type: Date,
      required: true
    },

    toDate: {
      type: Date,
      required: true
    },

    numberOfDays: {
      type: Number,
      required: true,
      min: 1
    },

    reason: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled'
      ],
      default: 'Pending'
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    reviewDate: {
      type: Date,
      default: null
    },

    remarks: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Leave', leaveSchema);