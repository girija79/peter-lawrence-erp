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

// Admin + Accountant + Employee
router.get(
  '/',
  protect,
  authorize('admin', 'accountant', 'employee'),
  getPayrolls
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'accountant', 'employee'),
  getPayrollById
);

// Admin + Accountant can create/update
router.post(
  '/',
  protect,
  authorize('admin', 'accountant'),
  createPayroll
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  updatePayroll
);

// Admin only can delete
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deletePayroll
);

module.exports = router;