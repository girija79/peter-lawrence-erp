const mongoose = require('mongoose');
const EmployeePayment = require('../models/EmployeePayment');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');

// @desc    Get employee payments
// @route   GET /api/employee-payments
const getEmployeePayments = async (req, res) => {
  try {
    let query = {};

    // Employee can see only their own payments
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({
        userId: req.user._id
      });

      if (!employee) {
        return res.status(404).json({
          message:
            'Employee profile not linked to this user account'
        });
      }

      query.employeeId = employee._id;
    }

    const payments = await EmployeePayment.find(query)
      .populate(
        'employeeId',
        'employeeId fullName email department designation'
      )
      .populate(
        'payrollId',
        'payrollNumber salaryMonth netSalary paymentStatus'
      )
      .sort({
        paymentDate: -1,
        createdAt: -1
      });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch employee payments',
      error: error.message
    });
  }
};


// @desc    Get single employee payment
// @route   GET /api/employee-payments/:id
const getEmployeePaymentById = async (req, res) => {
  try {
    const payment = await EmployeePayment.findById(
      req.params.id
    )
      .populate(
        'employeeId',
        'employeeId fullName email department designation userId'
      )
      .populate(
        'payrollId',
        'payrollNumber salaryMonth netSalary paymentStatus'
      );

    if (!payment) {
      return res.status(404).json({
        message: 'Employee payment not found'
      });
    }

    // Employee can view only their own payment
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({
        userId: req.user._id
      });

      if (!employee) {
        return res.status(404).json({
          message:
            'Employee profile not linked to this user account'
        });
      }

      if (
        payment.employeeId._id.toString() !==
        employee._id.toString()
      ) {
        return res.status(403).json({
          message:
            'Access denied: you can only view your own payments'
        });
      }
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch employee payment',
      error: error.message
    });
  }
};


// @desc    Create employee payment
// @route   POST /api/employee-payments
const createEmployeePayment = async (req, res) => {
  try {
    const {
      paymentNumber,
      employeeId,
      payrollId = null,
      paymentDate,
      amount,
      paymentMethod = 'Bank Transfer',
      transactionReference = '',
      paymentStatus = 'Pending',
      remarks = ''
    } = req.body;

    // Required fields
    if (
      !paymentNumber ||
      !employeeId ||
      !paymentDate ||
      amount === undefined ||
      amount === null
    ) {
      return res.status(400).json({
        message:
          'Payment number, employee, payment date and amount are required'
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

    // Validate amount
    const paymentAmount = Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount < 0
    ) {
      return res.status(400).json({
        message: 'Payment amount must be a valid non-negative number'
      });
    }

    // Validate optional payroll ID
    if (
      payrollId &&
      !mongoose.Types.ObjectId.isValid(payrollId)
    ) {
      return res.status(400).json({
        message: 'Invalid payroll ID'
      });
    }

    // If payroll is provided, verify that it belongs
    // to the selected employee
    if (payrollId) {
      const payroll = await Payroll.findById(payrollId);

      if (!payroll) {
        return res.status(404).json({
          message: 'Payroll record not found'
        });
      }

      if (
        payroll.employeeId.toString() !==
        employeeId.toString()
      ) {
        return res.status(400).json({
          message:
            'Selected payroll does not belong to this employee'
        });
      }
    }

    // Check duplicate payment number
    const existingPayment =
      await EmployeePayment.findOne({
        paymentNumber: paymentNumber.trim()
      });

    if (existingPayment) {
      return res.status(400).json({
        message: 'Payment number already exists'
      });
    }

    const payment = await EmployeePayment.create({
      paymentNumber: paymentNumber.trim(),
      employeeId,
      payrollId: payrollId || null,
      paymentDate,
      amount: paymentAmount,
      paymentMethod,
      transactionReference:
        transactionReference.trim(),
      paymentStatus,
      remarks: remarks.trim()
    });

    const populatedPayment =
      await EmployeePayment.findById(payment._id)
        .populate(
          'employeeId',
          'employeeId fullName email department designation'
        )
        .populate(
          'payrollId',
          'payrollNumber salaryMonth netSalary paymentStatus'
        );

    res.status(201).json({
      message:
        'Employee payment created successfully',
      payment: populatedPayment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Payment number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create employee payment',
      error: error.message
    });
  }
};


// @desc    Update employee payment
// @route   PUT /api/employee-payments/:id
const updateEmployeePayment = async (req, res) => {
  try {
    const payment =
      await EmployeePayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: 'Employee payment not found'
      });
    }

    const {
      paymentNumber,
      employeeId,
      payrollId,
      paymentDate,
      amount,
      paymentMethod,
      transactionReference,
      paymentStatus,
      remarks
    } = req.body;

    const newEmployeeId =
      employeeId || payment.employeeId;

    // Validate employee ID
    if (
      !mongoose.Types.ObjectId.isValid(newEmployeeId)
    ) {
      return res.status(400).json({
        message: 'Invalid employee ID'
      });
    }

    const employee =
      await Employee.findById(newEmployeeId);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    // Validate amount
    const newAmount =
      amount !== undefined
        ? Number(amount)
        : payment.amount;

    if (
      !Number.isFinite(newAmount) ||
      newAmount < 0
    ) {
      return res.status(400).json({
        message:
          'Payment amount must be a valid non-negative number'
      });
    }

    // Validate payroll
    const newPayrollId =
      payrollId !== undefined
        ? payrollId || null
        : payment.payrollId;

    if (
      newPayrollId &&
      !mongoose.Types.ObjectId.isValid(
        newPayrollId
      )
    ) {
      return res.status(400).json({
        message: 'Invalid payroll ID'
      });
    }

    if (newPayrollId) {
      const payroll =
        await Payroll.findById(newPayrollId);

      if (!payroll) {
        return res.status(404).json({
          message: 'Payroll record not found'
        });
      }

      if (
        payroll.employeeId.toString() !==
        newEmployeeId.toString()
      ) {
        return res.status(400).json({
          message:
            'Selected payroll does not belong to this employee'
        });
      }
    }

    // Update payment number
    if (paymentNumber !== undefined) {
      const duplicatePayment =
        await EmployeePayment.findOne({
          paymentNumber: paymentNumber.trim(),
          _id: { $ne: payment._id }
        });

      if (duplicatePayment) {
        return res.status(400).json({
          message: 'Payment number already exists'
        });
      }

      payment.paymentNumber =
        paymentNumber.trim();
    }

    payment.employeeId = newEmployeeId;
    payment.payrollId = newPayrollId;
    payment.amount = newAmount;

    if (paymentDate !== undefined) {
      payment.paymentDate = paymentDate;
    }

    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    if (transactionReference !== undefined) {
      payment.transactionReference =
        transactionReference.trim();
    }

    if (paymentStatus !== undefined) {
      payment.paymentStatus = paymentStatus;
    }

    if (remarks !== undefined) {
      payment.remarks = remarks.trim();
    }

    await payment.save();

    const updatedPayment =
      await EmployeePayment.findById(payment._id)
        .populate(
          'employeeId',
          'employeeId fullName email department designation'
        )
        .populate(
          'payrollId',
          'payrollNumber salaryMonth netSalary paymentStatus'
        );

    res.status(200).json({
      message:
        'Employee payment updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Payment number already exists'
      });
    }

    res.status(500).json({
      message:
        'Failed to update employee payment',
      error: error.message
    });
  }
};


// @desc    Delete employee payment
// @route   DELETE /api/employee-payments/:id
const deleteEmployeePayment = async (req, res) => {
  try {
    const payment =
      await EmployeePayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: 'Employee payment not found'
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      message:
        'Employee payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message:
        'Failed to delete employee payment',
      error: error.message
    });
  }
};


module.exports = {
  getEmployeePayments,
  getEmployeePaymentById,
  createEmployeePayment,
  updateEmployeePayment,
  deleteEmployeePayment
};