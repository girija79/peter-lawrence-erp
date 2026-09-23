const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    title: {
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
        'Appointment',
        'Case',
        'Document',
        'Payment',
        'Invoice',
        'Leave',
        'HR',
        'System',
        'Other'
      ],
      default: 'System'
    },

    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal'
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    relatedModel: {
      type: String,
      default: '',
      trim: true
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
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


// Important for notification polling:
// quickly find unread notifications for a particular user.
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1
});


// Quickly retrieve latest notifications for a user.
notificationSchema.index({
  recipient: 1,
  createdAt: -1
});


module.exports = mongoose.model('Notification', notificationSchema);