const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    attendanceDate: {
      type: Date,
      required: true
    },

    checkIn: {
      type: String,
      default: ''
    },

    checkOut: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: [
        'Present',
        'Absent',
        'Half Day',
        'Leave'
      ],
      default: 'Present'
    },

    remarks: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate attendance records for the same employee on the same date
attendanceSchema.index(
  { employeeId: 1, attendanceDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);