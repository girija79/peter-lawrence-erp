const express = require('express');

const {
  getEmployees,
  getEmployeeById,
  getMyEmployeeProfile,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get(
  '/me',
  protect,
  authorize('employee'),
  getMyEmployeeProfile
);

// Admin only
router.get(
  '/',
  protect,
  authorize('admin'),
  getEmployees
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getEmployeeById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createEmployee
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateEmployee
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteEmployee
);

module.exports = router;