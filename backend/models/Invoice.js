const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
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

    invoiceDate: {
      type: Date,
      required: true
    },

    dueDate: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      default: ''
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    tax: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        'Draft',
        'Issued',
        'Partially Paid',
        'Paid',
        'Overdue',
        'Cancelled'
      ],
      default: 'Draft'
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

module.exports = mongoose.model('Invoice', invoiceSchema);