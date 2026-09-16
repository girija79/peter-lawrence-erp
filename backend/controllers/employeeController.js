const Employee = require('../models/Employee');
const User = require('../models/User');


// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};


// Get single employee
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
};


// Create employee
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      userId,
      fullName,
      email,
      phone,
      department,
      designation,
      joiningDate,
      employmentType,
      reportingManager,
      address,
      salary,
      status,
      notes
    } = req.body;

    if (
      !employeeId ||
      !fullName ||
      !email ||
      !designation ||
      !joiningDate
    ) {
      return res.status(400).json({
        message:
          'Employee ID, full name, email, designation and joining date are required'
      });
    }

    // Check employee ID
    const existingEmployee = await Employee.findOne({ employeeId });

    if (existingEmployee) {
      return res.status(400).json({
        message: 'Employee ID already exists'
      });
    }

    // If linked to a user, verify user exists
    if (userId) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({
          message: 'Selected user not found'
        });
      }
    }

    const employee = await Employee.create({
      employeeId,
      userId: userId || null,
      fullName,
      email,
      phone: phone || '',
      department: department || 'Operations',
      designation,
      joiningDate,
      employmentType: employmentType || 'Full-Time',
      reportingManager: reportingManager || '',
      address: address || '',
      salary: Number(salary || 0),
      status: status || 'Active',
      notes: notes || ''
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'name email role');

    res.status(201).json(populatedEmployee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Employee ID already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create employee',
      error: error.message
    });
  }
};


// Update employee
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    const {
      employeeId,
      userId,
      fullName,
      email,
      phone,
      department,
      designation,
      joiningDate,
      employmentType,
      reportingManager,
      address,
      salary,
      status,
      notes
    } = req.body;

    // Check duplicate employee ID
    if (employeeId && employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({
        employeeId,
        _id: { $ne: employee._id }
      });

      if (existingEmployee) {
        return res.status(400).json({
          message: 'Employee ID already exists'
        });
      }

      employee.employeeId = employeeId;
    }

    // Validate linked user
    if (userId !== undefined && userId !== null && userId !== '') {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({
          message: 'Selected user not found'
        });
      }

      employee.userId = userId;
    }

    if (userId === '') {
      employee.userId = null;
    }

    if (fullName !== undefined) employee.fullName = fullName;
    if (email !== undefined) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;
    if (joiningDate !== undefined) employee.joiningDate = joiningDate;
    if (employmentType !== undefined) employee.employmentType = employmentType;
    if (reportingManager !== undefined) employee.reportingManager = reportingManager;
    if (address !== undefined) employee.address = address;
    if (salary !== undefined) employee.salary = Number(salary);
    if (status !== undefined) employee.status = status;
    if (notes !== undefined) employee.notes = notes;

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'name email role');

    res.json(updatedEmployee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Employee ID already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to update employee',
      error: error.message
    });
  }
};


// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    await employee.deleteOne();

    res.json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};


module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};