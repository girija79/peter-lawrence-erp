const User = require('../models/User');
const Client = require('../models/Client');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalClients = await Client.countDocuments();

    const totalLawyers = await User.countDocuments({
      role: 'lawyer'
    });

    const totalEmployees = await User.countDocuments({
      role: 'employee'
    });

    res.status(200).json({
      totalUsers,
      totalClients,
      totalLawyers,
      totalEmployees
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};