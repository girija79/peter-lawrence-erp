const express = require('express');

const {
  getLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer
} = require('../controllers/lawyerController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();
// Admin can manage all lawyer profiles
router.get('/', protect, authorize('admin'), getLawyers);
router.get('/:id', protect, authorize('admin'), getLawyerById);

router.post('/', protect, authorize('admin'), createLawyer);

router.put('/:id', protect, authorize('admin'), updateLawyer);

router.delete('/:id', protect, authorize('admin'), deleteLawyer);

module.exports = router;
