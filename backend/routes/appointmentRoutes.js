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

router.get(
  '/',
  protect,
  authorize('admin'),
  getAppointments
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getAppointmentById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  createAppointment
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateAppointment
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteAppointment
);

module.exports = router;