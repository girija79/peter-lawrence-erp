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

// Admin only
router.get(
  '/',
  protect,
  authorize('admin'),
  getCandidates
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getCandidateById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createCandidate
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateCandidate
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCandidate
);

module.exports = router;