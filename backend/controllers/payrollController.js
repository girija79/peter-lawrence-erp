const mongoose = require('mongoose');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

const calculateNetSalary = (basicSalary, bonus = 0, deductions = 0) => {
  return Number(basicSalary) + Number(bonus) - Number(deductions);
};

// @desc    Get all payroll records
// @route   GET /api/payroll
const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate(
        'employeeId',
        'employeeId fullName email department designation'
      )
      .sort({ salaryMonth: -1, createdAt: -1 });

    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch payroll records',
      error: error.message
    });
  }
};

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate(
      'employeeId',
      'employeeId fullName email department designation'
    );

    if (!payroll) {
      return res.status(404).json({
        message: 'Payroll record not found'
      });
    }

    res.status(200).json(payroll);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch payroll record',
      error: error.message
    });
  }
};

// @desc    Create payroll record
// @route   POST /api/payroll
const createPayroll = async (req, res) => {
  try {
    const {
      payrollNumber,
      employeeId,
      salaryMonth,
      basicSalary,
      bonus = 0,
      deductions = 0,
      paymentDate = null,
      paymentStatus = 'Pending',
      paymentMethod = 'Bank Transfer',
      notes = ''
    } = req.body;

    // Required fields
    if (
      !payrollNumber ||
      !employeeId ||
      !salaryMonth ||
      basicSalary === undefined ||
      basicSalary === null
    ) {
      return res.status(400).json({
        message:
          'Payroll number, employee, salary month and basic salary are required'
      });
    }

    // Validate employee ID
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        message: 'Invalid employee ID'
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Validate salary values
    const basic = Number(basicSalary);
    const bonusAmount = Number(bonus);
    const deductionAmount = Number(deductions);

    if (
      !Number.isFinite(basic) ||
      !Number.isFinite(bonusAmount) ||
      !Number.isFinite(deductionAmount)
    ) {
      return res.status(400).json({
        message: 'Salary, bonus and deductions must be valid numbers'
      });
    }

    if (basic < 0 || bonusAmount < 0 || deductionAmount < 0) {
      return res.status(400).json({
        message: 'Salary, bonus and deductions cannot be negative'
      });
    }

    const netSalary = calculateNetSalary(
      basic,
      bonusAmount,
      deductionAmount
    );

    if (netSalary < 0) {
      return res.status(400).json({
        message: 'Deductions cannot be greater than total earnings'
      });
    }

    // Prevent duplicate payroll for same employee and month
    const existingPayroll = await Payroll.findOne({
      employeeId,
      salaryMonth: salaryMonth.trim()
    });

    if (existingPayroll) {
      return res.status(400).json({
        message:
          'Payroll already exists for this employee and salary month'
      });
    }

    // Prevent duplicate payroll number
    const existingNumber = await Payroll.findOne({
      payrollNumber: payrollNumber.trim()
    });

    if (existingNumber) {
      return res.status(400).json({
        message: 'Payroll number already exists'
      });
    }

    const payroll = await Payroll.create({
      payrollNumber: payrollNumber.trim(),
      employeeId,
      salaryMonth: salaryMonth.trim(),
      basicSalary: basic,
      bonus: bonusAmount,
      deductions: deductionAmount,
      netSalary,
      paymentDate: paymentDate || null,
      paymentStatus,
      paymentMethod,
      notes: notes.trim()
    });

    const populatedPayroll = await Payroll.findById(
      payroll._id
    ).populate(
      'employeeId',
      'employeeId fullName email department designation'
    );

    res.status(201).json({
      message: 'Payroll record created successfully',
      payroll: populatedPayroll
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create payroll record',
      error: error.message
    });
  }
};

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        message: 'Payroll record not found'
      });
    }

    const {
      payrollNumber,
      employeeId,
      salaryMonth,
      basicSalary,
      bonus,
      deductions,
      paymentDate,
      paymentStatus,
      paymentMethod,
      notes
    } = req.body;

    const newEmployeeId = employeeId || payroll.employeeId;
    const newSalaryMonth =
      salaryMonth !== undefined
        ? salaryMonth.trim()
        : payroll.salaryMonth;

    // Validate employee
    if (!mongoose.Types.ObjectId.isValid(newEmployeeId)) {
      return res.status(400).json({
        message: 'Invalid employee ID'
      });
    }

    const employee = await Employee.findById(newEmployeeId);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    const basic =
      basicSalary !== undefined
        ? Number(basicSalary)
        : payroll.basicSalary;

    const bonusAmount =
      bonus !== undefined ? Number(bonus) : payroll.bonus;

    const deductionAmount =
      deductions !== undefined
        ? Number(deductions)
        : payroll.deductions;

    if (
      !Number.isFinite(basic) ||
      !Number.isFinite(bonusAmount) ||
      !Number.isFinite(deductionAmount)
    ) {
      return res.status(400).json({
        message: 'Salary, bonus and deductions must be valid numbers'
      });
    }

    if (basic < 0 || bonusAmount < 0 || deductionAmount < 0) {
      return res.status(400).json({
        message: 'Salary, bonus and deductions cannot be negative'
      });
    }

    const netSalary = calculateNetSalary(
      basic,
      bonusAmount,
      deductionAmount
    );

    if (netSalary < 0) {
      return res.status(400).json({
        message: 'Deductions cannot be greater than total earnings'
      });
    }

    // Check duplicate employee + month
    const duplicatePayroll = await Payroll.findOne({
      employeeId: newEmployeeId,
      salaryMonth: newSalaryMonth,
      _id: { $ne: payroll._id }
    });

    if (duplicatePayroll) {
      return res.status(400).json({
        message:
          'Payroll already exists for this employee and salary month'
      });
    }

    // Check duplicate payroll number
    if (payrollNumber !== undefined) {
      const duplicateNumber = await Payroll.findOne({
        payrollNumber: payrollNumber.trim(),
        _id: { $ne: payroll._id }
      });

      if (duplicateNumber) {
        return res.status(400).json({
          message: 'Payroll number already exists'
        });
      }

      payroll.payrollNumber = payrollNumber.trim();
    }

    payroll.employeeId = newEmployeeId;
    payroll.salaryMonth = newSalaryMonth;
    payroll.basicSalary = basic;
    payroll.bonus = bonusAmount;
    payroll.deductions = deductionAmount;
    payroll.netSalary = netSalary;

    if (paymentDate !== undefined) {
      payroll.paymentDate = paymentDate || null;
    }

    if (paymentStatus !== undefined) {
      payroll.paymentStatus = paymentStatus;
    }

    if (paymentMethod !== undefined) {
      payroll.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      payroll.notes = notes.trim();
    }

    await payroll.save();

    const updatedPayroll = await Payroll.findById(
      payroll._id
    ).populate(
      'employeeId',
      'employeeId fullName email department designation'
    );

    res.status(200).json({
      message: 'Payroll record updated successfully',
      payroll: updatedPayroll
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update payroll record',
      error: error.message
    });
  }
};

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        message: 'Payroll record not found'
      });
    }

    await payroll.deleteOne();

    res.status(200).json({
      message: 'Payroll record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete payroll record',
      error: error.message
    });
  }
};

module.exports = {
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll
};