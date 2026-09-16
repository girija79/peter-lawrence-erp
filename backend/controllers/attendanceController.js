const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Get all attendance records
const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('employeeId', 'employeeId fullName department designation')
      .sort({ attendanceDate: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Get attendance by ID
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('employeeId', 'employeeId fullName department designation');

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found'
      });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch attendance record',
      error: error.message
    });
  }
};

// Create attendance record
const createAttendance = async (req, res) => {
  try {
    const {
      employeeId,
      attendanceDate,
      checkIn,
      checkOut,
      status,
      remarks
    } = req.body;

    if (!employeeId || !attendanceDate) {
      return res.status(400).json({
        message: 'Employee and attendance date are required'
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Normalize date to avoid duplicate records caused by different times
    const date = new Date(attendanceDate);
    date.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employeeId,
      attendanceDate: date
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: 'Attendance already exists for this employee on this date'
      });
    }

    const attendance = await Attendance.create({
      employeeId,
      attendanceDate: date,
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      status: status || 'Present',
      remarks: remarks || ''
    });

    const populatedAttendance = await attendance.populate(
      'employeeId',
      'employeeId fullName department designation'
    );

    res.status(201).json(populatedAttendance);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create attendance record',
      error: error.message
    });
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found'
      });
    }

    const {
      employeeId,
      attendanceDate,
      checkIn,
      checkOut,
      status,
      remarks
    } = req.body;

    if (employeeId) {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({
          message: 'Employee not found'
        });
      }

      attendance.employeeId = employeeId;
    }

    if (attendanceDate) {
      const date = new Date(attendanceDate);
      date.setHours(0, 0, 0, 0);
      attendance.attendanceDate = date;
    }

    if (checkIn !== undefined) attendance.checkIn = checkIn;
    if (checkOut !== undefined) attendance.checkOut = checkOut;
    if (status !== undefined) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    const updatedAttendance = await attendance.populate(
      'employeeId',
      'employeeId fullName department designation'
    );

    res.json(updatedAttendance);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update attendance record',
      error: error.message
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.json({
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
};

module.exports = {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance
};