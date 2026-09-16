const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');

// Calculate number of days between two dates
const calculateDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference =
    Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return difference;
};

// Get all leave records
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate(
        'employeeId',
        'employeeId fullName department designation'
      )
      .populate(
        'reviewedBy',
        'name email role'
      )
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch leave records',
      error: error.message
    });
  }
};

// Get leave record by ID
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate(
        'employeeId',
        'employeeId fullName department designation'
      )
      .populate(
        'reviewedBy',
        'name email role'
      );

    if (!leave) {
      return res.status(404).json({
        message: 'Leave record not found'
      });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch leave record',
      error: error.message
    });
  }
};

// Create leave request
const createLeave = async (req, res) => {
  try {
    const {
      employeeId,
      leaveType,
      fromDate,
      toDate,
      reason,
      remarks
    } = req.body;

    if (
      !employeeId ||
      !fromDate ||
      !toDate ||
      !reason
    ) {
      return res.status(400).json({
        message:
          'Employee, dates and reason are required'
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      return res.status(400).json({
        message:
          'To date cannot be before from date'
      });
    }

    const numberOfDays = calculateDays(
      startDate,
      endDate
    );

    const leave = await Leave.create({
      employeeId,
      leaveType: leaveType || 'Casual Leave',
      fromDate: startDate,
      toDate: endDate,
      numberOfDays,
      reason,
      status: 'Pending',
      remarks: remarks || ''
    });

    const populatedLeave = await leave.populate(
      'employeeId',
      'employeeId fullName department designation'
    );

    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create leave request',
      error: error.message
    });
  }
};

// Update leave request
const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: 'Leave record not found'
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
      remarks
    } = req.body;

    if (employeeId) {
      const employee = await Employee.findById(
        employeeId
      );

      if (!employee) {
        return res.status(404).json({
          message: 'Employee not found'
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
      const newFromDate = fromDate
        ? new Date(fromDate)
        : leave.fromDate;

      const newToDate = toDate
        ? new Date(toDate)
        : leave.toDate;

      newFromDate.setHours(0, 0, 0, 0);
      newToDate.setHours(0, 0, 0, 0);

      if (newToDate < newFromDate) {
        return res.status(400).json({
          message:
            'To date cannot be before from date'
        });
      }

      leave.fromDate = newFromDate;
      leave.toDate = newToDate;

      leave.numberOfDays = calculateDays(
        newFromDate,
        newToDate
      );
    }

    if (status !== undefined) {
      leave.status = status;

      // Record reviewer information when admin
      // approves/rejects/cancels a request.
      if (
        ['Approved', 'Rejected', 'Cancelled'].includes(
          status
        )
      ) {
        leave.reviewedBy = reviewedBy || req.user?._id;
        leave.reviewDate = reviewDate
          ? new Date(reviewDate)
          : new Date();
      }
    }

    await leave.save();

    const updatedLeave = await leave
      .populate(
        'employeeId',
        'employeeId fullName department designation'
      )
      .then((result) =>
        result.populate(
          'reviewedBy',
          'name email role'
        )
      );

    res.json(updatedLeave);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update leave record',
      error: error.message
    });
  }
};

// Delete leave record
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: 'Leave record not found'
      });
    }

    await leave.deleteOne();

    res.json({
      message:
        'Leave record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete leave record',
      error: error.message
    });
  }
};

module.exports = {
  getLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave
};