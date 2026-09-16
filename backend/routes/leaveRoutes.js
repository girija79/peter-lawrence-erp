const express = require('express');

const {
  getLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave
} = require('../controllers/leaveController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin only
router.get(
  '/',
  protect,
  authorize('admin'),
  getLeaves
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getLeaveById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createLeave
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateLeave
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteLeave
);

module.exports = router;