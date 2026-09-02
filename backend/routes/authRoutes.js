const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);

// protected test route
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;