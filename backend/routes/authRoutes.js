const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// admin-only test route
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin!' });
});

module.exports = router;