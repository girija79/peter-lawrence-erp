const express = require('express');

const {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin only
router.get('/', protect, authorize('admin'), getAttendance);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getAttendanceById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createAttendance
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateAttendance
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteAttendance
);

module.exports = router;