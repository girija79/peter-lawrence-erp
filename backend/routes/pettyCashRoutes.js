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

// Admin only
router.get(
  '/',
  protect,
  authorize('admin'),
  getPettyCash
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getPettyCashById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createPettyCash
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updatePettyCash
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deletePettyCash
);

module.exports = router;