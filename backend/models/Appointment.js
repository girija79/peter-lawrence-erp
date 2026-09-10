const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    appointmentType: {
      type: String,
      enum: [
        'Client Meeting',
        'Court Hearing',
        'Consultation',
        'Internal Meeting',
        'Other'
      ],
      default: 'Client Meeting'
    },

    appointmentDate: {
      type: Date,
      required: true
    },

    location: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: [
        'Scheduled',
        'Completed',
        'Cancelled',
        'Rescheduled'
      ],
      default: 'Scheduled'
    },

    purpose: {
      type: String,
      default: ''
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

module.exports = mongoose.model('Appointment', appointmentSchema);