const express = require('express');

const router = express.Router();

const {
  getUsers,
  createUser,
  deleteUser,
  updateUser
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');

const { authorize } = require('../middleware/roleCheck');

// GET /api/users
// Admin only
router.get(
  '/',
  protect,
  authorize('admin'),
  getUsers
);

// POST /api/users
// Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  createUser
);

// PUT /api/users/:id
// Admin only
router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateUser
);

// DELETE /api/users/:id
// Admin only
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteUser
);

module.exports = router;