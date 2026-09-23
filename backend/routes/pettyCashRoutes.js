const express = require('express');

const {
  getPettyCash,
  getPettyCashById,
  createPettyCash,
  updatePettyCash,
  deletePettyCash
} = require('../controllers/pettyCashController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin + Accountant can view petty cash records
router.get(
  '/',
  protect,
  authorize('admin', 'accountant'),
  getPettyCash
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  getPettyCashById
);

// Admin + Accountant can create petty cash records
router.post(
  '/',
  protect,
  authorize('admin', 'accountant'),
  createPettyCash
);

// Admin + Accountant can update petty cash records
router.put(
  '/:id',
  protect,
  authorize('admin', 'accountant'),
  updatePettyCash
);

// Only Admin can delete petty cash records
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deletePettyCash
);

module.exports = router;