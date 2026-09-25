const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
    },

    casualLeave: {
      type: Number,
      default: 12,
      min: 0,
    },

    sickLeave: {
      type: Number,
      default: 12,
      min: 0,
    },

    annualLeave: {
      type: Number,
      default: 20,
      min: 0,
    },

    emergencyLeave: {
      type: Number,
      default: 5,
      min: 0,
    },

    casualLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    sickLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    annualLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    emergencyLeaveUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LeaveBalance",
  leaveBalanceSchema
);