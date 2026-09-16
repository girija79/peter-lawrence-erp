const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    payrollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    salaryMonth: {
      type: String,
      required: true,
      trim: true
    },

    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },

    bonus: {
      type: Number,
      default: 0,
      min: 0
    },

    deductions: {
      type: Number,
      default: 0,
      min: 0
    },

    netSalary: {
      type: Number,
      required: true,
      min: 0
    },

    paymentDate: {
      type: Date,
      default: null
    },

    paymentStatus: {
      type: String,
      enum: [
        'Pending',
        'Processed',
        'Paid'
      ],
      default: 'Pending'
    },

    paymentMethod: {
      type: String,
      enum: [
        'Bank Transfer',
        'Cash',
        'Cheque',
        'Other'
      ],
      default: 'Bank Transfer'
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

module.exports = mongoose.model('Payroll', payrollSchema);