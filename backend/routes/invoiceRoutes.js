const express = require('express');

const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin-only invoice management
router.get('/', protect, authorize('admin'), getInvoices);
router.get('/:id', protect, authorize('admin'), getInvoiceById);
router.post('/', protect, authorize('admin'), createInvoice);
router.put('/:id', protect, authorize('admin'), updateInvoice);
router.delete('/:id', protect, authorize('admin'), deleteInvoice);

module.exports = router;