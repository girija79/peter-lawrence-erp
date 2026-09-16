const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
      trim: true
    },

    contactPerson: {
      type: String,
      default: '',
      trim: true
    },

    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      default: ''
    },

    address: {
      type: String,
      default: ''
    },

    serviceType: {
      type: String,
      enum: [
        'Legal Services',
        'IT Services',
        'Office Supplies',
        'Consulting',
        'Maintenance',
        'Other'
      ],
      default: 'Other'
    },

    contractDetails: {
      type: String,
      default: ''
    },

    paymentTerms: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
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

module.exports = mongoose.model('Vendor', vendorSchema);