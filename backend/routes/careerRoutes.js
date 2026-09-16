const express = require('express');

const {
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer
} = require('../controllers/careerController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin only
router.get(
  '/',
  protect,
  authorize('admin'),
  getCareers
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getCareerById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createCareer
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateCareer
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCareer
);

module.exports = router;