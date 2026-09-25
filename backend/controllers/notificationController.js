const Notification = require('../models/Notification');
const User = require('../models/User');


// ============================================================
// GET LOGGED-IN USER'S NOTIFICATIONS
// ============================================================

const getNotifications = async (req, res) => {
  try {
    res.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

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


// ============================================================
// GET UNREAD COUNT
// ============================================================

const getUnreadCount = async (req, res) => {
  try {
    res.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

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
    console.error(
      'Unread notification count error:',
      error
    );

    res.status(500).json({
      message: 'Failed to fetch unread notification count'
    });
  }
};


// ============================================================
// CREATE NOTIFICATION
//
// Supports:
// 1. recipient      -> one specific user
// 2. recipientRole  -> every user with that role
// 3. allUsers       -> every user
//
// IMPORTANT:
// Each recipient receives a separate Notification document.
// ============================================================

const createNotification = async (req, res) => {
  try {
    const {
      recipient,
      recipientRole,
      allUsers = false,
      title,
      message,
      type = 'System',
      priority = 'Normal',
      relatedId = null,
      relatedModel = ''
    } = req.body;

    // ----------------------------------------------------------
    // Basic validation
    // ----------------------------------------------------------

    if (!title || !message) {
      return res.status(400).json({
        message: 'Title and message are required'
      });
    }

    // ----------------------------------------------------------
    // Allowed types
    // ----------------------------------------------------------

    const allowedTypes = [
      'Appointment',
      'Case',
      'Document',
      'Payment',
      'Invoice',
      'Leave',
      'Attendance',
      'Payroll',
      'Performance',
      'HR',
      'Communication',
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

    // ----------------------------------------------------------
    // Exactly one recipient mode
    // ----------------------------------------------------------

    const recipientModes =
      Number(Boolean(recipient)) +
      Number(Boolean(recipientRole)) +
      Number(Boolean(allUsers));

    if (recipientModes !== 1) {
      return res.status(400).json({
        message:
          'Choose exactly one recipient: specific user, role, or all users'
      });
    }

    // ----------------------------------------------------------
    // Find recipients
    // ----------------------------------------------------------

    let recipients = [];

    // Specific user
    if (recipient) {
      const user = await User.findById(recipient)
        .select('_id name email role');

      if (!user) {
        return res.status(404).json({
          message: 'Recipient user not found'
        });
      }

      recipients = [user];
    }

    // Specific role
    if (recipientRole) {
      const allowedRoles = [
        'admin',
        'lawyer',
        'hr',
        'accountant',
        'employee',
        'client'
      ];

      if (!allowedRoles.includes(recipientRole)) {
        return res.status(400).json({
          message: 'Invalid recipient role'
        });
      }

      recipients = await User.find({
        role: recipientRole
      }).select('_id name email role');
    }

    // Everyone
    if (allUsers) {
      recipients = await User.find({})
        .select('_id name email role');
    }

    if (recipients.length === 0) {
      return res.status(404).json({
        message: 'No users found for the selected recipient'
      });
    }

    // ----------------------------------------------------------
    // Create one notification per recipient
    // ----------------------------------------------------------

    const notificationDocuments = recipients.map((user) => ({
      recipient: user._id,
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
      relatedId: relatedId || null,
      relatedModel: relatedModel || '',
      isRead: false,
      readAt: null
    }));

    const notifications = await Notification.insertMany(
      notificationDocuments
    );

    res.status(201).json({
      message: 'Notification created successfully',
      recipientCount: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Create notification error:', error);

    res.status(500).json({
      message: 'Failed to create notification'
    });
  }
};


// ============================================================
// MARK ONE NOTIFICATION AS READ
// ============================================================

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
    console.error(
      'Mark notification as read error:',
      error
    );

    res.status(500).json({
      message: 'Failed to mark notification as read'
    });
  }
};


// ============================================================
// MARK ALL USER NOTIFICATIONS AS READ
// ============================================================

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
    console.error(
      'Mark all notifications as read error:',
      error
    );

    res.status(500).json({
      message: 'Failed to mark all notifications as read'
    });
  }
};


// ============================================================
// DELETE ONE USER'S NOTIFICATION
// ============================================================

const deleteNotification = async (req, res) => {
  try {
    const notification =
      await Notification.findOneAndDelete({
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
    console.error(
      'Delete notification error:',
      error
    );

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