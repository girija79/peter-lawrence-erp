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

// Admin + HR
router.get(
  '/',
  protect,
  authorize('admin', 'hr'),
  getCareers
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  getCareerById
);

router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createCareer
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  updateCareer
);

// Admin only
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCareer
);

module.exports = router;