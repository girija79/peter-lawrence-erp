const express = require('express');

const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Public registration
// Backend forces role to "client"
router.post('/register', registerUser);

// Public login
router.post('/login', loginUser);

// Forgot password
router.post('/forgot-password', forgotPassword);

//Reset password
router.put('/reset-password/:token', resetPassword);

// Get currently logged-in user
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// Admin-only test route
router.get(
  '/admin-only',
  protect,
  authorize('admin'),
  (req, res) => {
    res.json({ message: 'Welcome, admin!' });
  }
);

module.exports = router;