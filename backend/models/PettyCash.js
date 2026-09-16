const mongoose = require('mongoose');

const pettyCashSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    transactionDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    transactionType: {
      type: String,
      enum: ['Cash In', 'Cash Out'],
      required: true
    },

    category: {
      type: String,
      enum: [
        'Office Supplies',
        'Travel',
        'Utilities',
        'Meals & Refreshments',
        'Courier & Postage',
        'Maintenance',
        'Miscellaneous',
        'Other'
      ],
      default: 'Other'
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    partyName: {
      type: String,
      required: true,
      trim: true
    },

    paymentMethod: {
      type: String,
      enum: [
        'Cash',
        'Bank Transfer',
        'Cheque',
        'Other'
      ],
      default: 'Cash'
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected'
      ],
      default: 'Approved'
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

module.exports = mongoose.model(
  'PettyCash',
  pettyCashSchema
);