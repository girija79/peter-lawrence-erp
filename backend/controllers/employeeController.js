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

    // Validate linked user
    if (userId) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({
          message: 'Selected user not found'
        });
      }

      // Only employee-role users can be linked to Employee profiles
      if (user.role !== 'employee') {
        return res.status(400).json({
          message:
            'Selected user must have the employee role'
        });
      }

      // Prevent one user from having multiple employee profiles
      const existingUserEmployee = await Employee.findOne({
        userId
      });

      if (existingUserEmployee) {
        return res.status(400).json({
          message:
            'This user is already linked to an employee profile'
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
        message:
          'Employee ID or linked user already exists'
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
    if (
      userId !== undefined &&
      userId !== null &&
      userId !== ''
    ) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({
          message: 'Selected user not found'
        });
      }

      // Only employee-role users can be linked
      if (user.role !== 'employee') {
        return res.status(400).json({
          message:
            'Selected user must have the employee role'
        });
      }

      // Prevent linking the same user to another employee
      const existingUserEmployee = await Employee.findOne({
        userId,
        _id: { $ne: employee._id }
      });

      if (existingUserEmployee) {
        return res.status(400).json({
          message:
            'This user is already linked to another employee profile'
        });
      }

      employee.userId = userId;
    }

    // Remove linked user
    if (userId === '') {
      employee.userId = null;
    }

    if (fullName !== undefined) {
      employee.fullName = fullName;
    }

    if (email !== undefined) {
      employee.email = email;
    }

    if (phone !== undefined) {
      employee.phone = phone;
    }

    if (department !== undefined) {
      employee.department = department;
    }

    if (designation !== undefined) {
      employee.designation = designation;
    }

    if (joiningDate !== undefined) {
      employee.joiningDate = joiningDate;
    }

    if (employmentType !== undefined) {
      employee.employmentType = employmentType;
    }

    if (reportingManager !== undefined) {
      employee.reportingManager = reportingManager;
    }

    if (address !== undefined) {
      employee.address = address;
    }

    if (salary !== undefined) {
      employee.salary = Number(salary);
    }

    if (status !== undefined) {
      employee.status = status;
    }

    if (notes !== undefined) {
      employee.notes = notes;
    }

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'name email role');

    res.json(updatedEmployee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          'Employee ID or linked user already exists'
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


// Get logged-in employee's own profile
const getMyEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id
    })
      .select(
        'employeeId fullName email phone department designation joiningDate employmentType reportingManager address salary status userId'
      )
      .populate('userId', 'name email role');

    if (!employee) {
      return res.status(404).json({
        message: 'Employee profile not found'
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch your employee profile',
      error: error.message
    });
  }
};


module.exports = {
  getEmployees,
  getEmployeeById,
  getMyEmployeeProfile,
  createEmployee,
  updateEmployee,
  deleteEmployee
};