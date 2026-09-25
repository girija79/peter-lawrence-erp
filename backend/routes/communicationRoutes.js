const express = require('express');

const {
  getCommunications,
  getCommunicationById,
  createCommunication,
  markCommunicationRead,
  deleteCommunication
} = require('../controllers/communicationController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin and HR can view communications
router.get(
  '/',
  protect,
  authorize(
    'admin',
    'hr',
    'lawyer',
    'accountant',
    'employee',
    'client'
  ),
  getCommunications
);

// View one communication
router.get(
  '/:id',
  protect,
  authorize(
    'admin',
    'hr',
    'lawyer',
    'accountant',
    'employee',
    'client'
  ),
  getCommunicationById
);

// Admin and HR can send communications
router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createCommunication
);

// Recipient can mark communication as read
router.put(
  '/:id/read',
  protect,
  authorize(
    'admin',
    'hr',
    'lawyer',
    'accountant',
    'employee',
    'client'
  ),
  markCommunicationRead
);

// Admin can delete communications
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCommunication
);

module.exports = router;