const express = require('express');

const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase
} = require('../controllers/caseController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin — full case management
router.get(
  '/',
  protect,
  authorize('admin' , 'lawyer'),
  getCases
);

router.get(
  '/:id',
  protect,
  authorize('admin' , 'lawyer'),
  getCaseById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createCase
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateCase
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCase
);

module.exports = router;