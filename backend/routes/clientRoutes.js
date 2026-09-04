const express = require('express');

const router = express.Router();

const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');

const { protect } = require('../middleware/auth');

// GET /api/clients
router.get(
  '/',
  protect,
  getClients
);

// GET /api/clients/:id
router.get(
  '/:id',
  protect,
  getClientById
);

// POST /api/clients
router.post(
  '/',
  protect,
  createClient
);

// PUT /api/clients/:id
router.put(
  '/:id',
  protect,
  updateClient
);

// DELETE /api/clients/:id
router.delete(
  '/:id',
  protect,
  deleteClient
);

module.exports = router;