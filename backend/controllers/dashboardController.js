const User = require("../models/User");
const Client = require("../models/Client");
const Lawyer = require("../models/Lawyer");
const Employee = require("../models/Employee");
const Case = require("../models/Case");
const Invoice = require("../models/Invoice");
const Leave = require("../models/Leave");
const Document = require("../models/Document");
const Appointment = require("../models/Appointment");

const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;

    // =====================================================
    // ADMIN DASHBOARD
    // =====================================================
    if (role === "admin") {
      const totalUsers = await User.countDocuments();

      const totalClients = await Client.countDocuments();

      const totalLawyers = await Lawyer.countDocuments();

      const totalEmployees = await Employee.countDocuments();

      const totalHR = await User.countDocuments({
        role: "hr",
      });

      const totalAccountants = await User.countDocuments({
        role: "accountant",
      });

      const totalAdmins = await User.countDocuments({
        role: "admin",
      });

      const activeCases = await Case.countDocuments({
        status: "Active",
      });

      const upcomingHearings = await Case.countDocuments({
        nextHearingDate: {
          $gte: new Date(),
        },
        status: {
          $nin: ["Closed", "Won", "Lost"],
        },
      });

      const invoices = await Invoice.find({
        status: {
          $in: [
            "Issued",
            "Partially Paid",
            "Overdue",
          ],
        },
      }).select("totalAmount");

      const outstandingBilling = invoices.reduce(
        (total, invoice) =>
          total + (invoice.totalAmount || 0),
        0
      );

      const pendingLeaves = await Leave.countDocuments({
        status: "Pending",
      });

      return res.status(200).json({
        role,

        totalUsers,
        totalClients,
        totalLawyers,
        totalEmployees,
        totalHR,
        totalAccountants,
        totalAdmins,

        activeCases,
        upcomingHearings,
        outstandingBilling,
        pendingLeaves,
      });
    }

    // =====================================================
    // LAWYER DASHBOARD
    // =====================================================
    if (role === "lawyer") {
      const lawyer = await Lawyer.findOne({
        userId: req.user._id,
      });

      if (!lawyer) {
        return res.status(404).json({
          message: "Lawyer profile not found",
        });
      }

      const myCases = await Case.find({
        lawyerId: lawyer._id,
      }).select(
        "caseNumber title clientId status nextHearingDate"
      );

      const clientIds = [
        ...new Set(
          myCases
            .map((caseItem) =>
              caseItem.clientId
                ? caseItem.clientId.toString()
                : null
            )
            .filter(Boolean)
        ),
      ];

      const activeCases = myCases.filter(
        (caseItem) =>
          caseItem.status === "Active"
      ).length;

      const now = new Date();

      const upcomingHearings = myCases.filter(
        (caseItem) =>
          caseItem.nextHearingDate &&
          new Date(caseItem.nextHearingDate) >= now &&
          ![
            "Closed",
            "Won",
            "Lost",
          ].includes(caseItem.status)
      ).length;

      const caseIds = myCases.map(
        (caseItem) => caseItem._id
      );

      const myDocuments =
        await Document.countDocuments({
          caseId: {
            $in: caseIds,
          },
        });

      const upcomingAppointments =
        await Appointment.countDocuments({
          lawyerId: lawyer._id,

          appointmentDate: {
            $gte: new Date(),
          },

          status: {
            $in: [
              "Scheduled",
              "Rescheduled",
            ],
          },
        });

      return res.status(200).json({
        role,

        lawyerName: lawyer.fullName,

        myClients: clientIds.length,

        myCases: myCases.length,

        activeCases,

        upcomingHearings,

        upcomingAppointments,

        myDocuments,
      });
    }

    // =====================================================
    // HR DASHBOARD
    // =====================================================
    if (role === "hr") {
      const totalEmployees =
        await Employee.countDocuments();

      const activeEmployees =
        await Employee.countDocuments({
          status: "Active",
        });

      const employeesOnLeave =
        await Employee.countDocuments({
          status: "On Leave",
        });

      const resignedEmployees =
        await Employee.countDocuments({
          status: "Resigned",
        });

      const terminatedEmployees =
        await Employee.countDocuments({
          status: "Terminated",
        });

      const pendingLeaves =
        await Leave.countDocuments({
          status: "Pending",
        });

      const totalEmployeeDocuments =
        await Document.countDocuments({
          documentCategory: {
            $in: [
              "HR",
              "Employee",
              "Identity",
            ],
          },
        });

      const recentEmployees =
        await Employee.countDocuments({
          joiningDate: {
            $gte: new Date(
              new Date().setMonth(
                new Date().getMonth() - 1
              )
            ),
          },
        });

      return res.status(200).json({
        role,

        totalEmployees,

        activeEmployees,

        employeesOnLeave,

        resignedEmployees,

        terminatedEmployees,

        pendingLeaves,

        totalEmployeeDocuments,

        recentEmployees,
      });
    }

    // =====================================================
    // ACCOUNTANT DASHBOARD
    // =====================================================
    if (role === "accountant") {
      const totalInvoices =
        await Invoice.countDocuments();

      const issuedInvoices =
        await Invoice.countDocuments({
          status: "Issued",
        });

      const partiallyPaidInvoices =
        await Invoice.countDocuments({
          status: "Partially Paid",
        });

      const overdueInvoices =
        await Invoice.countDocuments({
          status: "Overdue",
        });

      const paidInvoices =
        await Invoice.countDocuments({
          status: "Paid",
        });

      const invoices =
        await Invoice.find({
          status: {
            $in: [
              "Issued",
              "Partially Paid",
              "Overdue",
            ],
          },
        }).select("totalAmount");

      const outstandingBilling =
        invoices.reduce(
          (total, invoice) =>
            total +
            (invoice.totalAmount || 0),
          0
        );

      return res.status(200).json({
        role,

        totalInvoices,

        issuedInvoices,

        partiallyPaidInvoices,

        overdueInvoices,

        paidInvoices,

        outstandingBilling,
      });
    }

    // =====================================================
    // EMPLOYEE DASHBOARD
    // =====================================================
    if (role === "employee") {
      const employee = await Employee.findOne({
        userId: req.user._id,
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee profile not found",
        });
      }

      const myDocuments =
        await Document.countDocuments({
          employeeId: employee._id,
        });

      const myPendingLeaves =
        await Leave.countDocuments({
          employeeId: employee._id,
          status: "Pending",
        });

      return res.status(200).json({
        role,

        employeeName: employee.fullName,

        department: employee.department,

        designation: employee.designation,

        employmentType: employee.employmentType,

        joiningDate: employee.joiningDate,

        employeeStatus: employee.status,

        myDocuments,

        myPendingLeaves,
      });
    }

    // =====================================================
    // CLIENT DASHBOARD
    // =====================================================
    if (role === "client") {
      return res.status(200).json({
        role,
      });
    }

    // =====================================================
    // FALLBACK
    // =====================================================
    return res.status(200).json({
      role,
    });

  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};