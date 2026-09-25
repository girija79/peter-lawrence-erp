const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    recipientRole: {
      type: String,
      enum: [
        'admin',
        'lawyer',
        'hr',
        'accountant',
        'employee',
        'client',
        'all'
      ],
      default: null
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: [
        'Announcement',
        'Internal Message',
        'HR Notice',
        'General'
      ],
      default: 'General'
    },

    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal'
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Useful indexes
communicationSchema.index({
  recipientId: 1,
  createdAt: -1
});

communicationSchema.index({
  recipientRole: 1,
  createdAt: -1
});

communicationSchema.index({
  senderId: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  'Communication',
  communicationSchema
);