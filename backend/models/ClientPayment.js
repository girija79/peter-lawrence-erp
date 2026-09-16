const mongoose = require('mongoose');

const clientPaymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
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
        'Cash',
        'Bank Transfer',
        'Card',
        'Online Payment',
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

    status: {
      type: String,
      enum: [
        'Pending',
        'Completed',
        'Failed',
        'Refunded'
      ],
      default: 'Completed'
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

module.exports = mongoose.model('ClientPayment', clientPaymentSchema);