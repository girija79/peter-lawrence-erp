const express = require('express');

const {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidateController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin + HR
router.get(
  '/',
  protect,
  authorize('admin', 'hr'),
  getCandidates
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  getCandidateById
);

router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createCandidate
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  updateCandidate
);

// Admin only
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCandidate
);

module.exports = router;