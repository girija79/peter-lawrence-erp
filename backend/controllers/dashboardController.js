const User = require("../models/User");
const Client = require("../models/Client");
const Lawyer = require("../models/Lawyer");
const Employee = require("../models/Employee");
const Case = require("../models/Case");
const Invoice = require("../models/Invoice");
const Leave = require("../models/Leave");

const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalLawyers = await Lawyer.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const totalHR = await User.countDocuments({
      role: "hr",
    });

    const totalAccountants = await User.countDocuments({
      role: "accountant",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    // Active legal cases
    const activeCases = await Case.countDocuments({
      status: "Active",
    });

    // Upcoming hearings
    const upcomingHearings = await Case.countDocuments({
      nextHearingDate: { $gte: new Date() },
      status: { $nin: ["Closed", "Won", "Lost"] },
    });

    // Outstanding billing
    const invoices = await Invoice.find({
      status: {
        $in: ["Issued", "Partially Paid", "Overdue"],
      },
    }).select("totalAmount status");

    const outstandingBilling = invoices.reduce(
      (total, invoice) => total + (invoice.totalAmount || 0),
      0,
    );

    // Pending leave requests
    const pendingLeaves = await Leave.countDocuments({
      status: "Pending",
    });

    res.status(200).json({
      totalUsers,
      totalClients,
      totalLawyers,
      totalEmployees,
      totalHR,
      totalAccountants,
      totalAdmins,
      activeCases,
      upcomingHearings,
      outstandingBilling,
      pendingLeaves,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};
