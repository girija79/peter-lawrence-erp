const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Calculate number of days between two dates
const calculateDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return difference;
};

// Get all leave records
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employeeId", "employeeId fullName department designation")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leave records",
      error: error.message,
    });
  }
};

// Get leave record by ID
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate("employeeId", "employeeId fullName department designation")
      .populate("reviewedBy", "name email role");

    if (!leave) {
      return res.status(404).json({
        message: "Leave record not found",
      });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leave record",
      error: error.message,
    });
  }
};

// Create leave request
const createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, fromDate, toDate, reason, remarks } =
      req.body;

    if (!employeeId || !fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: "Employee, dates and reason are required",
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      return res.status(400).json({
        message: "To date cannot be before from date",
      });
    }

    const numberOfDays = calculateDays(startDate, endDate);

    const leave = await Leave.create({
      employeeId,
      leaveType: leaveType || "Casual Leave",
      fromDate: startDate,
      toDate: endDate,
      numberOfDays,
      reason,
      status: "Pending",
      remarks: remarks || "",
    });

    const populatedLeave = await leave.populate(
      "employeeId",
      "employeeId fullName department designation",
    );

    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create leave request",
      error: error.message,
    });
  }
};

const createMyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason, remarks } = req.body;

    // Find the employee profile linked to the logged-in user
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found",
      });
    }

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        message: "Dates and reason are required",
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      return res.status(400).json({
        message: "To date cannot be before from date",
      });
    }

    const numberOfDays = calculateDays(startDate, endDate);

    const leave = await Leave.create({
      // IMPORTANT:
      // Employee ID comes from the logged-in user,
      // not from the frontend.
      employeeId: employee._id,

      leaveType: leaveType || "Casual Leave",
      fromDate: startDate,
      toDate: endDate,
      numberOfDays,
      reason: reason.trim(),
      status: "Pending",
      remarks: remarks || "",
    });

    const populatedLeave = await leave.populate(
      "employeeId",
      "employeeId fullName department designation",
    );

    // Notify all admins about the new leave request
    const admins = await User.find({
      role: "admin",
    });

    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          recipient: admin._id,
          title: "New Leave Request",
          message: `${employee.fullName} has submitted a ${leave.leaveType} request for ${numberOfDays} day(s).`,
          type: "Leave",
          priority: "High",
          relatedId: leave._id,
          relatedModel: "Leave",
        }),
      ),
    );


    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit leave request",
      error: error.message,
    });
  }
};

// Update leave request
const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave record not found",
      });
    }

    const {
      employeeId,
      leaveType,
      fromDate,
      toDate,
      reason,
      status,
      reviewedBy,
      reviewDate,
      remarks,
    } = req.body;

    if (employeeId) {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      leave.employeeId = employeeId;
    }

    if (leaveType !== undefined) {
      leave.leaveType = leaveType;
    }

    if (reason !== undefined) {
      leave.reason = reason;
    }

    if (remarks !== undefined) {
      leave.remarks = remarks;
    }

    if (fromDate || toDate) {
      const newFromDate = fromDate ? new Date(fromDate) : leave.fromDate;

      const newToDate = toDate ? new Date(toDate) : leave.toDate;

      newFromDate.setHours(0, 0, 0, 0);
      newToDate.setHours(0, 0, 0, 0);

      if (newToDate < newFromDate) {
        return res.status(400).json({
          message: "To date cannot be before from date",
        });
      }

      leave.fromDate = newFromDate;
      leave.toDate = newToDate;

      leave.numberOfDays = calculateDays(newFromDate, newToDate);
    }

    if (status !== undefined) {
      leave.status = status;

      if (["Approved", "Rejected", "Cancelled"].includes(status)) {
        leave.reviewedBy = reviewedBy || req.user?._id;

        leave.reviewDate = reviewDate ? new Date(reviewDate) : new Date();

        // Notify the employee about the decision
        const employee = await Employee.findById(leave.employeeId);

        if (employee?.userId) {
          let notificationTitle = "Leave Request Updated";

          let notificationMessage = `Your ${leave.leaveType} request has been ${status.toLowerCase()}.`;

          if (status === "Approved") {
            notificationTitle = "Leave Request Approved";
          }

          if (status === "Rejected") {
            notificationTitle = "Leave Request Rejected";
          }

          if (status === "Cancelled") {
            notificationTitle = "Leave Request Cancelled";
          }

          await Notification.create({
            recipient: employee.userId,
            title: notificationTitle,
            message: notificationMessage,
            type: "Leave",
            priority: status === "Rejected" ? "High" : "Normal",
            relatedId: leave._id,
            relatedModel: "Leave",
          });
        }
      }
    }
    await leave.save();

    const updatedLeave = await leave
      .populate("employeeId", "employeeId fullName department designation")
      .then((result) => result.populate("reviewedBy", "name email role"));

    res.json(updatedLeave);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update leave record",
      error: error.message,
    });
  }
};

// Delete leave record
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave record not found",
      });
    }

    await leave.deleteOne();

    res.json({
      message: "Leave record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete leave record",
      error: error.message,
    });
  }
};

// Get logged-in employee's own leave requests
const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found",
      });
    }

    const leaves = await Leave.find({
      employeeId: employee._id,
    })
      .populate("employeeId", "employeeId fullName department designation")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your leave requests",
      error: error.message,
    });
  }
};

module.exports = {
  getLeaves,
  getLeaveById,
  getMyLeaves,
  createLeave,
  createMyLeave,
  updateLeave,
  deleteLeave,
};
