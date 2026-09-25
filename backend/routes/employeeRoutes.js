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


// Employee can view own profile
router.get(
  '/me',
  protect,
  authorize('employee'),
  getMyEmployeeProfile
);


// Admin + HR can view employees
router.get(
  '/',
  protect,
  authorize('admin', 'hr'),
  getEmployees
);


// Admin + HR can view employee details
router.get(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  getEmployeeById
);


// Admin + HR can create employees
router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createEmployee
);


// Admin + HR can update employees
router.put(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  updateEmployee
);


// Only Admin can delete employees
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteEmployee
);


module.exports = router;