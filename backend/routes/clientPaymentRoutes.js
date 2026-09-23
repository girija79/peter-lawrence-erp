const express = require('express');

const {
  getClientPayments,
  getClientPaymentById,
  createClientPayment,
  updateClientPayment,
  deleteClientPayment
} = require('../controllers/clientPaymentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin + Accountant can view client payments
router.get(
  '/',
  protect,
  authorize('admin', 'accountant'),
  getClientPayments
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  getClientPaymentById
);

// Admin + Accountant can create/update payments
router.post(
  '/',
  protect,
  authorize('admin', 'accountant'),
  createClientPayment
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  updateClientPayment
);

// Delete remains Admin-only
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteClientPayment
);

module.exports = router;