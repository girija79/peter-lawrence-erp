const express = require('express');

const {
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll
} = require('../controllers/payrollController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin only
router.get(
  '/',
  protect,
  authorize('admin'),
  getPayrolls
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getPayrollById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createPayroll
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updatePayroll
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deletePayroll
);

module.exports = router;