const mongoose = require('mongoose');

const employeePaymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
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

    payrollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payroll',
      default: null
    },

    paymentDate: {
      type: Date,
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
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

    transactionReference: {
      type: String,
      default: '',
      trim: true
    },

    paymentStatus: {
      type: String,
      enum: [
        'Pending',
        'Processing',
        'Completed',
        'Failed',
        'Cancelled'
      ],
      default: 'Pending'
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

employeePaymentSchema.index({
  employeeId: 1,
  paymentDate: -1
});

module.exports = mongoose.model(
  'EmployeePayment',
  employeePaymentSchema
);