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

router.get('/', protect, authorize('admin'), getVendors);
router.get('/:id', protect, authorize('admin'), getVendorById);
router.post('/', protect, authorize('admin'), createVendor);
router.put('/:id', protect, authorize('admin'), updateVendor);
router.delete('/:id', protect, authorize('admin'), deleteVendor);

module.exports = router;