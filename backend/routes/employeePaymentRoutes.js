const express = require('express');

const {
  getEmployeePayments,
  getEmployeePaymentById,
  createEmployeePayment,
  updateEmployeePayment,
  deleteEmployeePayment
} = require('../controllers/employeePaymentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin + Accountant + Employee
// Employee sees only their own payments
router.get(
  '/',
  protect,
  authorize('admin', 'accountant', 'employee'),
  getEmployeePayments
);

// Admin + Accountant + Employee
router.get(
  '/:id',
  protect,
  authorize('admin', 'accountant', 'employee'),
  getEmployeePaymentById
);

// Admin + Accountant
router.post(
  '/',
  protect,
  authorize('admin', 'accountant'),
  createEmployeePayment
);

// Admin + Accountant
router.put(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  updateEmployeePayment
);

// Admin only
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteEmployeePayment
);

module.exports = router;