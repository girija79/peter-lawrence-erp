const express = require('express');

const router = express.Router();

const {
  getDashboardStats
} = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Admin only
router.get(
  '/stats',
  protect,
  authorize(
  'admin',
  'lawyer',
  'hr',
  'accountant',
  'employee',
  'client'
),
  getDashboardStats
);

module.exports = router;