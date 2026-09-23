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

// Admin + Accountant can view invoices
router.get(
  '/',
  protect,
  authorize('admin', 'accountant'),
  getInvoices
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  getInvoiceById
);

// Admin + Accountant can create/update invoices
router.post(
  '/',
  protect,
  authorize('admin', 'accountant'),
  createInvoice
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  updateInvoice
);

// Delete remains Admin-only
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteInvoice
);

module.exports = router;