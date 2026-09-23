const Report = require('../models/Report');

const Case = require('../models/Case');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const ClientPayment = require('../models/ClientPayment');
const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Vendor = require('../models/Vendor');
const PettyCash = require('../models/PettyCash');
const Candidate = require('../models/Candidate');

// Get all reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('generatedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Get reports error:', error);

    res.status(500).json({
      message: 'Failed to fetch reports'
    });
  }
};

// Get single report
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email role');

    if (!report) {
      return res.status(404).json({
        message: 'Report not found'
      });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Get report error:', error);

    res.status(500).json({
      message: 'Failed to fetch report'
    });
  }
};

// Create report
const createReport = async (req, res) => {
  try {
    const {
      reportNumber,
      reportType,
      reportTitle,
      periodFrom,
      periodTo,
      summary,
      reportData,
      status
    } = req.body;

    if (!reportNumber || !reportType || !reportTitle) {
      return res.status(400).json({
        message: 'Report number, type and title are required'
      });
    }

    const existingReport = await Report.findOne({
      reportNumber: reportNumber.trim()
    });

    if (existingReport) {
      return res.status(400).json({
        message: 'Report number already exists'
      });
    }

    if (periodFrom && periodTo) {
      const from = new Date(periodFrom);
      const to = new Date(periodTo);

      if (from > to) {
        return res.status(400).json({
          message: 'Period From cannot be later than Period To'
        });
      }
    }

    const report = await Report.create({
      reportNumber: reportNumber.trim(),
      reportType,
      reportTitle: reportTitle.trim(),
      periodFrom: periodFrom || null,
      periodTo: periodTo || null,
      generatedBy: req.user._id,
      summary: summary || '',
      reportData: reportData || {},
      status: status || 'Generated'
    });

    const populatedReport = await Report.findById(report._id)
      .populate('generatedBy', 'name email role');

    res.status(201).json(populatedReport);
  } catch (error) {
    console.error('Create report error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Report number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create report'
    });
  }
};

// Update report
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found'
      });
    }

    const {
      reportNumber,
      reportType,
      reportTitle,
      periodFrom,
      periodTo,
      summary,
      reportData,
      status
    } = req.body;

    if (!reportNumber || !reportType || !reportTitle) {
      return res.status(400).json({
        message: 'Report number, type and title are required'
      });
    }

    const duplicateReport = await Report.findOne({
      reportNumber: reportNumber.trim(),
      _id: { $ne: req.params.id }
    });

    if (duplicateReport) {
      return res.status(400).json({
        message: 'Report number already exists'
      });
    }

    if (periodFrom && periodTo) {
      const from = new Date(periodFrom);
      const to = new Date(periodTo);

      if (from > to) {
        return res.status(400).json({
          message: 'Period From cannot be later than Period To'
        });
      }
    }

    report.reportNumber = reportNumber.trim();
    report.reportType = reportType;
    report.reportTitle = reportTitle.trim();
    report.periodFrom = periodFrom || null;
    report.periodTo = periodTo || null;
    report.summary = summary || '';
    report.reportData = reportData || {};
    report.status = status || 'Generated';

    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('generatedBy', 'name email role');

    res.status(200).json(populatedReport);
  } catch (error) {
    console.error('Update report error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Report number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to update report'
    });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found'
      });
    }

    await report.deleteOne();

    res.status(200).json({
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);

    res.status(500).json({
      message: 'Failed to delete report'
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      totalCases,
      activeCases,
      closedCases,
      totalClients,
      totalEmployees,
      totalVendors,
      totalCandidates,
      totalInvoices,
      totalPayments,
      payrollRecords
    ] = await Promise.all([
      Case.countDocuments(),
      Case.countDocuments({ status: 'Active' }),
      Case.countDocuments({
        status: { $in: ['Closed', 'Won', 'Lost'] }
      }),
      Client.countDocuments(),
      Employee.countDocuments(),
      Vendor.countDocuments(),
      Candidate.countDocuments(),
      Invoice.countDocuments(),
      ClientPayment.countDocuments({
        status: 'Completed'
      }),
      Payroll.find().select('netSalary paymentStatus')
    ]);

    const totalRevenue = await ClientPayment.aggregate([
      {
        $match: {
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalPayroll = payrollRecords.reduce(
      (total, payroll) => total + (payroll.netSalary || 0),
      0
    );

    const totalPettyCashIn = await PettyCash.aggregate([
      {
        $match: {
          transactionType: 'Cash In',
          status: 'Approved'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalPettyCashOut = await PettyCash.aggregate([
      {
        $match: {
          transactionType: 'Cash Out',
          status: 'Approved'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const revenue =
      totalRevenue.length > 0
        ? totalRevenue[0].total
        : 0;

    const pettyCashIn =
      totalPettyCashIn.length > 0
        ? totalPettyCashIn[0].total
        : 0;

    const pettyCashOut =
      totalPettyCashOut.length > 0
        ? totalPettyCashOut[0].total
        : 0;

    res.status(200).json({
      cases: {
        total: totalCases,
        active: activeCases,
        closed: closedCases
      },

      clients: {
        total: totalClients
      },

      employees: {
        total: totalEmployees
      },

      vendors: {
        total: totalVendors
      },

      recruitment: {
        totalCandidates
      },

      billing: {
        totalInvoices
      },

      revenue: {
        total: revenue
      },

      payments: {
        completed: totalPayments
      },

      payroll: {
        total: totalPayroll,
        records: payrollRecords.length
      },

      pettyCash: {
        totalIn: pettyCashIn,
        totalOut: pettyCashOut,
        balance: pettyCashIn - pettyCashOut
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);

    res.status(500).json({
      message: 'Failed to generate analytics'
    });
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getAnalytics
};