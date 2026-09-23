const express = require('express');

const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();


// Get logged-in user's notifications
router.get(
  '/',
  protect,
  getNotifications
);


// Get unread notification count
router.get(
  '/unread-count',
  protect,
  getUnreadCount
);


// Create notification
// Currently restricted to Admin.
// Later, automatic notifications will be generated
// by appointment, case, payment, HR, etc. events.
router.post(
  '/',
  protect,
  authorize('admin'),
  createNotification
);


// Mark one notification as read
router.put(
  '/:id/read',
  protect,
  markAsRead
);


// Mark all notifications as read
router.put(
  '/read-all',
  protect,
  markAllAsRead
);


// Delete one notification
router.delete(
  '/:id',
  protect,
  deleteNotification
);


module.exports = router;