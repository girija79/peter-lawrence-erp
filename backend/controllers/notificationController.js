const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    // Prevent browser/proxy from returning an old notification list
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const notifications = await Notification.find({
      recipient: req.user._id
    })
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);

    res.status(500).json({
      message: 'Failed to fetch notifications'
    });
  }
};


// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.status(200).json({
      count
    });
  } catch (error) {
    console.error('Unread notification count error:', error);

    res.status(500).json({
      message: 'Failed to fetch unread notification count'
    });
  }
};


// Create notification
const createNotification = async (req, res) => {
  try {
    const {
      recipient,
      title,
      message,
      type = 'System',
      priority = 'Normal',
      relatedId = null,
      relatedModel = ''
    } = req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({
        message: 'Recipient, title and message are required'
      });
    }

    const user = await User.findById(recipient);

    if (!user) {
      return res.status(404).json({
        message: 'Recipient user not found'
      });
    }

    const allowedTypes = [
      'Appointment',
      'Case',
      'Document',
      'Payment',
      'Invoice',
      'Leave',
      'HR',
      'System',
      'Other'
    ];

    const allowedPriorities = [
      'Low',
      'Normal',
      'High',
      'Urgent'
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid notification type'
      });
    }

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: 'Invalid notification priority'
      });
    }

    const notification = await Notification.create({
      recipient: user._id,
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      relatedId: relatedId || null,
      relatedModel: relatedModel || '',
      isRead: false,
      readAt: null
    });

    const populatedNotification = await Notification.findById(
      notification._id
    )
      .populate('recipient', 'name email role')
      .lean();

    res.status(201).json(populatedNotification);
  } catch (error) {
    console.error('Create notification error:', error);

    res.status(500).json({
      message: 'Failed to create notification'
    });
  }
};


// Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);

    res.status(500).json({
      message: 'Failed to mark notification as read'
    });
  }
};


// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);

    res.status(500).json({
      message: 'Failed to mark all notifications as read'
    });
  }
};


// Delete one notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);

    res.status(500).json({
      message: 'Failed to delete notification'
    });
  }
};


module.exports = {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};