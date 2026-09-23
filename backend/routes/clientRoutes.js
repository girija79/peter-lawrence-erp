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
const { authorize } = require('../middleware/roleCheck');


router.get('/', protect, authorize('admin', 'lawyer', 'accountant', 'client'), getClients);
router.get('/:id', protect, authorize('admin', 'lawyer', 'accountant', 'client'), getClientById);

// POST /api/clients
// Admin only
router.post(
    '/',
    protect,
    authorize('admin'),
    createClient
);


// PUT /api/clients/:id
// Admin only
router.put(
    '/:id',
    protect,
    authorize('admin'),
    updateClient
);


// DELETE /api/clients/:id
// Admin only
router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteClient
);


module.exports = router;