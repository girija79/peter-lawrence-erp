const express = require('express');

const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin + Accountant can view vendors
router.get(
  '/',
  protect,
  authorize('admin', 'accountant'),
  getVendors
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  getVendorById
);

// Only Admin can manage vendors
router.post(
  '/',
  protect,
  authorize('admin'),
  createVendor
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateVendor
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteVendor
);

module.exports = router;