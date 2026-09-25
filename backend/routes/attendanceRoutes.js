const express = require('express');

const {
  getAttendance,
  getAttendanceById,
  getMyAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();


// Admin + HR can view all attendance
router.get(
  '/',
  protect,
  authorize('admin', 'hr'),
  getAttendance
);


// Employee can view own attendance
router.get(
  '/me',
  protect,
  authorize('employee'),
  getMyAttendance
);


// Admin + HR can view individual attendance
router.get(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  getAttendanceById
);


// Admin + HR can create attendance
router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createAttendance
);


// Admin + HR can update attendance
router.put(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  updateAttendance
);


// Only Admin can delete attendance
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteAttendance
);


module.exports = router;