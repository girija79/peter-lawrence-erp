
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');

// =====================================================
// GET ALL LAWYERS
// =====================================================
const getLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(lawyers);
  } catch (error) {
    console.error('Get Lawyers Error:', error);

    res.status(500).json({
      message: 'Failed to fetch lawyers',
      error: error.message
    });
  }
};

// =====================================================
// GET SINGLE LAWYER
// =====================================================
const getLawyerById = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!lawyer) {
      return res.status(404).json({
        message: 'Lawyer not found'
      });
    }

    res.status(200).json(lawyer);
  } catch (error) {
    console.error('Get Lawyer Error:', error);

    res.status(500).json({
      message: 'Failed to fetch lawyer',
      error: error.message
    });
  }
};

// =====================================================
// CREATE LAWYER PROFILE
// =====================================================
const createLawyer = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      specialization,
      barRegistrationNo,
      experience,
      status,
      joiningDate
    } = req.body;

    // Validate required fields
    if (!userId || !fullName || !email) {
      return res.status(400).json({
        message: 'User, full name and email are required'
      });
    }

    // Check user account
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User account not found'
      });
    }

    // Make sure selected user has lawyer role
    if (user.role !== 'lawyer') {
      return res.status(400).json({
        message: 'Selected user does not have lawyer role'
      });
    }

    // Prevent duplicate lawyer profile
    const existingLawyer = await Lawyer.findOne({ userId });

    if (existingLawyer) {
      return res.status(400).json({
        message: 'Lawyer profile already exists for this user'
      });
    }

    // Create lawyer profile
    const lawyer = await Lawyer.create({
      userId,
      fullName,
      email,
      phone: phone || '',
      specialization: specialization || '',
      barRegistrationNo: barRegistrationNo || '',
      experience: experience || 0,
      status: status || 'Active',
      joiningDate
    });

    // Return populated lawyer
    const populatedLawyer = await Lawyer.findById(lawyer._id)
      .populate('userId', 'name email role');

    res.status(201).json(populatedLawyer);
  } catch (error) {
    console.error('Create Lawyer Error:', error);

    res.status(500).json({
      message: 'Failed to create lawyer',
      error: error.message
    });
  }
};

// =====================================================
// UPDATE LAWYER PROFILE
// =====================================================
const updateLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({
        message: 'Lawyer not found'
      });
    }

    const {
      fullName,
      email,
      phone,
      specialization,
      barRegistrationNo,
      experience,
      status,
      joiningDate
    } = req.body;

    // Update only fields that are provided
    if (fullName !== undefined) {
      lawyer.fullName = fullName;
    }

    if (email !== undefined) {
      lawyer.email = email;
    }

    if (phone !== undefined) {
      lawyer.phone = phone;
    }

    if (specialization !== undefined) {
      lawyer.specialization = specialization;
    }

    if (barRegistrationNo !== undefined) {
      lawyer.barRegistrationNo = barRegistrationNo;
    }

    if (experience !== undefined) {
      lawyer.experience = experience;
    }

    if (status !== undefined) {
      lawyer.status = status;
    }

    if (joiningDate !== undefined) {
      lawyer.joiningDate = joiningDate;
    }

    await lawyer.save();

    const updatedLawyer = await Lawyer.findById(lawyer._id)
      .populate('userId', 'name email role');

    res.status(200).json(updatedLawyer);
  } catch (error) {
    console.error('Update Lawyer Error:', error);

    res.status(500).json({
      message: 'Failed to update lawyer',
      error: error.message
    });
  }
};

// =====================================================
// DELETE LAWYER PROFILE
// =====================================================
const deleteLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({
        message: 'Lawyer not found'
      });
    }

    await lawyer.deleteOne();

    res.status(200).json({
      message: 'Lawyer profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete Lawyer Error:', error);

    res.status(500).json({
      message: 'Failed to delete lawyer',
      error: error.message
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================
module.exports = {
  getLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer
};

