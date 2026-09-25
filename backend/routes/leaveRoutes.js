const express = require('express');

const {
  getLeaves,
  getLeaveById,
  getMyLeaves,
  createLeave,
  createMyLeave,
  updateLeave,
  deleteLeave
} = require('../controllers/leaveController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();


// Employee can view own leave requests
router.get(
  '/me',
  protect,
  authorize('employee'),
  getMyLeaves
);


// Employee can submit own leave request
router.post(
  '/me',
  protect,
  authorize('employee'),
  createMyLeave
);


// Admin + HR can view all leave records
router.get(
  '/',
  protect,
  authorize('admin', 'hr'),
  getLeaves
);


// Admin + HR can view individual leave record
router.get(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  getLeaveById
);


// Admin + HR can create leave records
router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createLeave
);


// Admin + HR can update / approve / reject leave
router.put(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  updateLeave
);


// Only Admin can permanently delete leave records
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteLeave
);


module.exports = router;