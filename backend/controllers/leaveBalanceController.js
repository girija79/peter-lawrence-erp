const LeaveBalance = require("../models/LeaveBalance");
const Employee = require("../models/Employee");

// Get all leave balances
const getLeaveBalances = async (req, res) => {
  try {
    const balances = await LeaveBalance.find()
      .populate(
        "employeeId",
        "employeeId fullName department designation"
      )
      .sort({ createdAt: -1 });

    res.json(balances);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leave balances",
      error: error.message,
    });
  }
};

// Get current employee's leave balance
const getMyLeaveBalance = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found",
      });
    }

    let balance = await LeaveBalance.findOne({
      employeeId: employee._id,
      year: new Date().getFullYear(),
    }).populate(
      "employeeId",
      "employeeId fullName department designation"
    );

    // Create default balance automatically if it doesn't exist
    if (!balance) {
      balance = await LeaveBalance.create({
        employeeId: employee._id,
        year: new Date().getFullYear(),
      });

      balance = await LeaveBalance.findById(
        balance._id
      ).populate(
        "employeeId",
        "employeeId fullName department designation"
      );
    }

    res.json(balance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your leave balance",
      error: error.message,
    });
  }
};

// Get leave balance by employee ID
const getLeaveBalanceByEmployee = async (req, res) => {
  try {
    const balance = await LeaveBalance.findOne({
      employeeId: req.params.employeeId,
      year: new Date().getFullYear(),
    }).populate(
      "employeeId",
      "employeeId fullName department designation"
    );

    if (!balance) {
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    res.json(balance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leave balance",
      error: error.message,
    });
  }
};

// Create leave balance
const createLeaveBalance = async (req, res) => {
  try {
    const {
      employeeId,
      casualLeave,
      sickLeave,
      annualLeave,
      emergencyLeave,
      year,
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        message: "Employee is required",
      });
    }

    const existingBalance = await LeaveBalance.findOne({
      employeeId,
      year: year || new Date().getFullYear(),
    });

    if (existingBalance) {
      return res.status(400).json({
        message:
          "Leave balance already exists for this employee and year",
      });
    }

    const balance = await LeaveBalance.create({
      employeeId,
      casualLeave,
      sickLeave,
      annualLeave,
      emergencyLeave,
      year: year || new Date().getFullYear(),
    });

    const populatedBalance =
      await LeaveBalance.findById(balance._id).populate(
        "employeeId",
        "employeeId fullName department designation"
      );

    res.status(201).json(populatedBalance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create leave balance",
      error: error.message,
    });
  }
};

// Update leave balance
const updateLeaveBalance = async (req, res) => {
  try {
    const balance =
      await LeaveBalance.findById(req.params.id);

    if (!balance) {
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    const {
      casualLeave,
      sickLeave,
      annualLeave,
      emergencyLeave,
      casualLeaveUsed,
      sickLeaveUsed,
      annualLeaveUsed,
      emergencyLeaveUsed,
    } = req.body;

    if (casualLeave !== undefined)
      balance.casualLeave = casualLeave;

    if (sickLeave !== undefined)
      balance.sickLeave = sickLeave;

    if (annualLeave !== undefined)
      balance.annualLeave = annualLeave;

    if (emergencyLeave !== undefined)
      balance.emergencyLeave = emergencyLeave;

    if (casualLeaveUsed !== undefined)
      balance.casualLeaveUsed = casualLeaveUsed;

    if (sickLeaveUsed !== undefined)
      balance.sickLeaveUsed = sickLeaveUsed;

    if (annualLeaveUsed !== undefined)
      balance.annualLeaveUsed = annualLeaveUsed;

    if (emergencyLeaveUsed !== undefined)
      balance.emergencyLeaveUsed =
        emergencyLeaveUsed;

    await balance.save();

    const populatedBalance =
      await LeaveBalance.findById(balance._id).populate(
        "employeeId",
        "employeeId fullName department designation"
      );

    res.json(populatedBalance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update leave balance",
      error: error.message,
    });
  }
};

// Delete leave balance
const deleteLeaveBalance = async (req, res) => {
  try {
    const balance =
      await LeaveBalance.findById(req.params.id);

    if (!balance) {
      return res.status(404).json({
        message: "Leave balance not found",
      });
    }

    await balance.deleteOne();

    res.json({
      message: "Leave balance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete leave balance",
      error: error.message,
    });
  }
};

module.exports = {
  getLeaveBalances,
  getMyLeaveBalance,
  getLeaveBalanceByEmployee,
  createLeaveBalance,
  updateLeaveBalance,
  deleteLeaveBalance,
};