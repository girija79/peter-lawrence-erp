const express = require('express');

const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin + Lawyer can view appointments
router.get(
  '/',
  protect,
  authorize('admin', 'lawyer'),
  getAppointments
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'lawyer'),
  getAppointmentById
);

// Only Admin can create appointments
router.post(
  '/',
  protect,
  authorize('admin'),
  createAppointment
);

// Only Admin can update appointments
router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateAppointment
);

// Only Admin can delete appointments
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteAppointment
);

module.exports = router;