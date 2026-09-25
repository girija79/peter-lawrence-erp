const express = require('express');

const {
  getPerformances,
  getMyPerformances,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance
} = require('../controllers/performanceController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();


// ==========================================
// GET ALL PERFORMANCE REVIEWS
// Admin + HR
// ==========================================

router.get(
  '/',
  protect,
  authorize('admin', 'hr'),
  getPerformances
);


// ==========================================
// GET MY PERFORMANCE REVIEWS
// Employee
//
// IMPORTANT:
// Must come before /:id
// ==========================================

router.get(
  '/me',
  protect,
  authorize('employee'),
  getMyPerformances
);


// ==========================================
// GET SINGLE PERFORMANCE REVIEW
// Admin + HR + Employee
//
// Employee ownership is checked
// inside the controller.
// ==========================================

router.get(
  '/:id',
  protect,
  authorize(
    'admin',
    'hr',
    'employee'
  ),
  getPerformanceById
);


// ==========================================
// CREATE PERFORMANCE REVIEW
// Admin + HR
// ==========================================

router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createPerformance
);


// ==========================================
// UPDATE PERFORMANCE REVIEW
// Admin + HR
// ==========================================

router.put(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  updatePerformance
);


// ==========================================
// DELETE PERFORMANCE REVIEW
// Admin only
// ==========================================

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deletePerformance
);


module.exports = router;