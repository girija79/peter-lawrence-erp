const User = require('../models/User');

// GET /api/users
// Admin only
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);

  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch users'
    });
  }
};

// POST /api/users
// Admin only
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'Name, email, password and role are required'
      });
    }

    const allowedRoles = [
      'admin',
      'lawyer',
      'employee',
      'client'
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

// DELETE /api/users/:id
// Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'User deleted successfully'
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete user'
    });
  }
};

// PUT /api/users/:id
// Admin only
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const allowedRoles = [
      'admin',
      'lawyer',
      'employee',
      'client'
    ];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role'
      });
    }

    // Check if email is already used by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: req.params.id }
      });

      if (emailExists) {
        return res.status(400).json({
          message: 'Email already exists'
        });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Only update password if a new password is provided
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  updateUser
};