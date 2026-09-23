const express = require('express');

const {
  getPaymentReceipt
} = require('../controllers/receiptController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Get receipt data for a completed client payment
router.get(
  '/:id',
  protect,
  authorize('admin' , 'accountant'),
  getPaymentReceipt
);

module.exports = router;