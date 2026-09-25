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


// ============================================================
// USER NOTIFICATIONS
// ============================================================

// Logged-in user gets ONLY their notifications
router.get(
  '/',
  protect,
  getNotifications
);


// Unread count for logged-in user
router.get(
  '/unread-count',
  protect,
  getUnreadCount
);


// ============================================================
// ADMIN NOTIFICATION CREATION
// ============================================================

// Admin can send:
// - to one user
// - to one role
// - to everyone
router.post(
  '/',
  protect,
  authorize('admin'),
  createNotification
);


// ============================================================
// USER NOTIFICATION ACTIONS
// ============================================================

// Mark one notification as read
router.put(
  '/:id/read',
  protect,
  markAsRead
);


// Mark all logged-in user's notifications as read
router.put(
  '/read-all',
  protect,
  markAllAsRead
);


// Delete one logged-in user's notification
router.delete(
  '/:id',
  protect,
  deleteNotification
);


module.exports = router;