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

// Admin-only client payment management
router.get('/', protect, authorize('admin'), getClientPayments);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getClientPaymentById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createClientPayment
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateClientPayment
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteClientPayment
);

module.exports = router;