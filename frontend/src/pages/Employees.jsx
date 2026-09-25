import { useEffect, useMemo, useState, useContext } from "react";

import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const initialForm = {
  employeeId: "",
  userId: "",
  fullName: "",
  email: "",
  phone: "",
  department: "Operations",
  designation: "",
  joiningDate: "",
  employmentType: "Full-Time",
  reportingManager: "",
  address: "",
  salary: "",
  status: "Active",
  notes: "",
};

function Employees() {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === "admin";
  const isHR = user?.role === "hr";
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [employeePayroll, setEmployeePayroll] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const employeesRes = await api.get("/employees");
      setEmployees(employeesRes.data);

      // Only Admin needs the User Account list
      // HR can manage employee records without managing system user accounts
      if (isAdmin) {
        const usersRes = await api.get("/users");

        setUsers(usersRes.data.filter((user) => user.role === "employee"));
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to load employees:", error);

      setError(error.response?.data?.message || "Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "Active").length,
    [employees],
  );

  const onLeaveEmployees = useMemo(
    () => employees.filter((employee) => employee.status === "On Leave").length,
    [employees],
  );

  const totalPayroll = useMemo(
    () =>
      employees
        .filter((employee) => employee.status !== "Terminated")
        .reduce((sum, employee) => sum + Number(employee.salary || 0), 0),
    [employees],
  );

  // Filter employees for the register
  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !search ||
        employee.fullName?.toLowerCase().includes(search) ||
        employee.employeeId?.toLowerCase().includes(search) ||
        employee.email?.toLowerCase().includes(search);

      const matchesDepartment =
        !departmentFilter || employee.department === departmentFilter;

      const matchesStatus = !statusFilter || employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const attendanceSummary = useMemo(() => {
    return {
      total: employeeAttendance.length,
      present: employeeAttendance.filter(
        (record) => record.status === "Present",
      ).length,
      absent: employeeAttendance.filter((record) => record.status === "Absent")
        .length,
      halfDay: employeeAttendance.filter(
        (record) => record.status === "Half Day",
      ).length,
      leave: employeeAttendance.filter((record) => record.status === "Leave")
        .length,
    };
  }, [employeeAttendance]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setStatusFilter("");
  };

  // View employee
  const handleView = async (employee) => {
    setSelectedEmployee(employee);
    setEmployeeAttendance([]);
    setEmployeeLeaves([]);
    setEmployeePayroll([]);
    setAttendanceLoading(true);
    setLeaveLoading(true);

    // Payroll is only available to Admin
    if (isAdmin) {
      setPayrollLoading(true);
    } else {
      setPayrollLoading(false);
    }

    setError("");
    setSuccess("");

    try {
      const response = await api.get("/attendance");

      const employeeAttendanceRecords = response.data.filter(
        (record) =>
          record.employeeId?._id === employee._id ||
          record.employeeId === employee._id,
      );

      setEmployeeAttendance(employeeAttendanceRecords);
    } catch (err) {
      console.error("Failed to load employee attendance:", err);
      setEmployeeAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }

    try {
      const response = await api.get("/leaves");

      const employeeLeaveRecords = response.data.filter(
        (record) =>
          record.employeeId?._id === employee._id ||
          record.employeeId === employee._id,
      );

      setEmployeeLeaves(employeeLeaveRecords);
    } catch (err) {
      console.error("Failed to load employee leave records:", err);
      setEmployeeLeaves([]);
    } finally {
      setLeaveLoading(false);
    }

    // Only Admin can view employee payroll history
    if (isAdmin) {
      try {
        const response = await api.get("/payroll");

        const employeePayrollRecords = response.data.filter((record) => {
          const recordEmployeeId = record.employeeId?._id || record.employeeId;

          return String(recordEmployeeId) === String(employee._id);
        });

        setEmployeePayroll(employeePayrollRecords);
      } catch (err) {
        console.error("Failed to load employee payroll:", err);
        setEmployeePayroll([]);
      } finally {
        setPayrollLoading(false);
      }
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeEmployeeDetails = () => {
    setSelectedEmployee(null);
  };

  const leaveSummary = useMemo(() => {
    return {
      total: employeeLeaves.length,
      pending: employeeLeaves.filter((leave) => leave.status === "Pending")
        .length,
      approved: employeeLeaves.filter((leave) => leave.status === "Approved")
        .length,
      rejected: employeeLeaves.filter((leave) => leave.status === "Rejected")
        .length,
      cancelled: employeeLeaves.filter((leave) => leave.status === "Cancelled")
        .length,
    };
  }, [employeeLeaves]);

  const getPayrollValue = (record, keys, fallback = 0) => {
    for (const key of keys) {
      if (
        record?.[key] !== undefined &&
        record?.[key] !== null &&
        record?.[key] !== ""
      ) {
        return record[key];
      }
    }
    return fallback;
  };

  const getPayrollPeriod = (record) => {
    const period = getPayrollValue(
      record,
      ["payrollMonth", "payPeriodMonth", "month", "salaryMonth", "payPeriod"],
      "",
    );

    if (!period) return "-";
    if (typeof period === "string") return period;
    return formatDate(period);
  };

  const payrollSummary = useMemo(() => {
    const totalNetSalary = employeePayroll.reduce(
      (sum, record) =>
        sum +
        Number(
          getPayrollValue(record, ["netSalary", "netPay", "netAmount"], 0),
        ),
      0,
    );

    const totalGrossSalary = employeePayroll.reduce(
      (sum, record) =>
        sum +
        Number(
          getPayrollValue(
            record,
            ["grossSalary", "grossPay", "grossAmount"],
            0,
          ),
        ),
      0,
    );

    return {
      total: employeePayroll.length,
      totalNetSalary,
      totalGrossSalary,
    };
  }, [employeePayroll]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.employeeId.trim()) {
        setError("Employee ID is required.");
        return;
      }

      if (!form.fullName.trim()) {
        setError("Full name is required.");
        return;
      }

      if (!form.email.trim()) {
        setError("Email is required.");
        return;
      }

      if (!form.designation.trim()) {
        setError("Designation is required.");
        return;
      }

      if (!form.joiningDate) {
        setError("Joining date is required.");
        return;
      }

      if (form.salary && Number(form.salary) < 0) {
        setError("Salary cannot be negative.");
        return;
      }

      const payload = {
        employeeId: form.employeeId.trim(),
        userId: form.userId || null,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department,
        designation: form.designation.trim(),
        joiningDate: form.joiningDate,
        employmentType: form.employmentType,
        reportingManager: form.reportingManager.trim(),
        address: form.address.trim(),
        salary: Number(form.salary || 0),
        status: form.status,
        notes: form.notes.trim(),
      };

      const wasEditing = Boolean(editingId);

      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);

        setSuccess("Employee updated successfully.");
      } else {
        await api.post("/employees", payload);

        setSuccess("Employee added successfully.");
      }

      resetForm();

      setSuccess(
        wasEditing
          ? "Employee updated successfully."
          : "Employee added successfully.",
      );

      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save employee.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(null);
    setEditingId(employee._id);

    setForm({
      employeeId: employee.employeeId || "",
      userId: employee.userId?._id || "",
      fullName: employee.fullName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "Operations",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().split("T")[0]
        : "",
      employmentType: employee.employmentType || "Full-Time",
      reportingManager: employee.reportingManager || "",
      address: employee.address || "",
      salary: employee.salary || "",
      status: employee.status || "Active",
      notes: employee.notes || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee record?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/employees/${employeeId}`);

      if (editingId === employeeId) {
        resetForm();
      }

      if (selectedEmployee?._id === employeeId) {
        setSelectedEmployee(null);
      }

      setSuccess("Employee deleted successfully.");

      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete employee.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";

      case "On Leave":
        return "status-warning";

      case "Resigned":
      case "Terminated":
        return "status-inactive";

      default:
        return "status-neutral";
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">Administration / Workforce</p>

          <h1>Employees</h1>

          <p className="page-description">
            Maintain employee records, employment details, organisational
            assignments and workforce status.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      {/* Summary */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Employees</div>

          <div className="summary-value">{employees.length}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Active Employees</div>

          <div className="summary-value">{activeEmployees}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">On Leave</div>

          <div className="summary-value">{onLeaveEmployees}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Monthly Payroll</div>

          <div className="summary-value">₹{formatCurrency(totalPayroll)}</div>
        </div>
      </div>

      {/* Employee Details */}
      {selectedEmployee && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h2>Employee Details</h2>

              <p>Complete employment profile</p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={closeEmployeeDetails}
            >
              <i className="bi bi-x-lg me-2"></i>
              Close
            </button>
          </div>

          <div className="card-body">
            <div className="row g-4">
              {/* Employee Identity */}
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <h5 className="mb-3">
                    <i className="bi bi-person me-2"></i>
                    Personal Information
                  </h5>

                  <p className="mb-2">
                    <strong>Full Name:</strong>{" "}
                    {selectedEmployee.fullName || "-"}
                  </p>

                  <p className="mb-2">
                    <strong>Employee ID:</strong>{" "}
                    {selectedEmployee.employeeId || "-"}
                  </p>

                  <p className="mb-2">
                    <strong>Email:</strong> {selectedEmployee.email || "-"}
                  </p>

                  <p className="mb-2">
                    <strong>Phone:</strong> {selectedEmployee.phone || "-"}
                  </p>

                  <p className="mb-0">
                    <strong>Address:</strong> {selectedEmployee.address || "-"}
                  </p>
                </div>
              </div>

              {/* Employment Information */}
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <h5 className="mb-3">
                    <i className="bi bi-briefcase me-2"></i>
                    Employment Information
                  </h5>

                  <p className="mb-2">
                    <strong>Department:</strong>{" "}
                    {selectedEmployee.department || "-"}
                  </p>

                  <p className="mb-2">
                    <strong>Designation:</strong>{" "}
                    {selectedEmployee.designation || "-"}
                  </p>

                  <p className="mb-2">
                    <strong>Employment Type:</strong>{" "}
                    {selectedEmployee.employmentType || "-"}
                  </p>

                  <p className="mb-2">
                    <strong>Joining Date:</strong>{" "}
                    {formatDate(selectedEmployee.joiningDate)}
                  </p>

                  <p className="mb-0">
                    <strong>Reporting Manager:</strong>{" "}
                    {selectedEmployee.reportingManager || "-"}
                  </p>
                </div>
              </div>

              {/* Salary and Status */}
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <h5 className="mb-3">
                    <i className="bi bi-cash-stack me-2"></i>
                    Compensation & Status
                  </h5>

                  <p className="mb-2">
                    <strong>Monthly Salary:</strong> ₹
                    {formatCurrency(selectedEmployee.salary)}
                  </p>

                  <p className="mb-2">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status-badge ${getStatusClass(
                        selectedEmployee.status,
                      )}`}
                    >
                      {selectedEmployee.status}
                    </span>
                  </p>

                  <p className="mb-0">
                    <strong>Notes:</strong> {selectedEmployee.notes || "-"}
                  </p>
                </div>
              </div>

              {/* User Account */}
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  {isAdmin && (
                    <>
                      <h5 className="mb-3">
                        <i className="bi bi-person-badge me-2"></i>
                        User Account
                      </h5>

                      {/* ALL existing User Account fields */}
                    </>
                  )}

                  {selectedEmployee.userId ? (
                    <>
                      <p className="mb-2">
                        <strong>Name:</strong>{" "}
                        {selectedEmployee.userId.name || "-"}
                      </p>

                      <p className="mb-2">
                        <strong>Email:</strong>{" "}
                        {selectedEmployee.userId.email || "-"}
                      </p>

                      <p className="mb-0">
                        <strong>Role:</strong>{" "}
                        {selectedEmployee.userId.role || "-"}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted mb-0">
                      No user account is linked to this employee.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div className="col-12">
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1">
                      <i className="bi bi-calendar-check me-2"></i>
                      Attendance
                    </h5>
                    <small className="text-muted">
                      Attendance summary for this employee
                    </small>
                  </div>
                </div>

                {attendanceLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status"></div>
                    <p className="mt-2 mb-0 text-muted">
                      Loading attendance...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="row g-3 mb-4">
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Total Records</div>
                          <h4 className="mb-0 mt-1">
                            {attendanceSummary.total}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Present</div>
                          <h4 className="mb-0 mt-1 text-success">
                            {attendanceSummary.present}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Absent</div>
                          <h4 className="mb-0 mt-1 text-danger">
                            {attendanceSummary.absent}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Half Day</div>
                          <h4 className="mb-0 mt-1 text-warning">
                            {attendanceSummary.halfDay}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Leave</div>
                          <h4 className="mb-0 mt-1">
                            {attendanceSummary.leave}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {employeeAttendance.length === 0 ? (
                      <div className="text-center py-3 text-muted">
                        <i className="bi bi-calendar-x fs-3 d-block mb-2"></i>
                        No attendance records found for this employee.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Check In</th>
                              <th>Check Out</th>
                              <th>Status</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employeeAttendance.slice(0, 10).map((record) => (
                              <tr key={record._id}>
                                <td>{formatDate(record.attendanceDate)}</td>
                                <td>{record.checkIn || "-"}</td>
                                <td>{record.checkOut || "-"}</td>
                                <td>
                                  <span
                                    className={`status-badge ${getStatusClass(record.status)}`}
                                  >
                                    {record.status}
                                  </span>
                                </td>
                                <td>{record.remarks || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {employeeAttendance.length > 10 && (
                      <div className="text-muted small mt-2">
                        Showing the latest 10 attendance records.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Leave */}
            <div className="col-12">
              <div className="border rounded p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1">
                      <i className="bi bi-calendar-minus me-2"></i>
                      Leave Management
                    </h5>
                    <small className="text-muted">
                      Leave requests and approval history for this employee
                    </small>
                  </div>
                </div>

                {leaveLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status"></div>
                    <p className="mt-2 mb-0 text-muted">
                      Loading leave records...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="row g-3 mb-4">
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Total Requests</div>
                          <h4 className="mb-0 mt-1">{leaveSummary.total}</h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Pending</div>
                          <h4 className="mb-0 mt-1 text-warning">
                            {leaveSummary.pending}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Approved</div>
                          <h4 className="mb-0 mt-1 text-success">
                            {leaveSummary.approved}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Rejected</div>
                          <h4 className="mb-0 mt-1 text-danger">
                            {leaveSummary.rejected}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md">
                        <div className="border rounded p-3 text-center">
                          <div className="text-muted small">Cancelled</div>
                          <h4 className="mb-0 mt-1">
                            {leaveSummary.cancelled}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {employeeLeaves.length === 0 ? (
                      <div className="text-center py-3 text-muted">
                        <i className="bi bi-calendar-x fs-3 d-block mb-2"></i>
                        No leave requests found for this employee.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Leave Type</th>
                              <th>From</th>
                              <th>To</th>
                              <th>Days</th>
                              <th>Reason</th>
                              <th>Status</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employeeLeaves.slice(0, 10).map((leave) => (
                              <tr key={leave._id}>
                                <td>{leave.leaveType || "-"}</td>
                                <td>{formatDate(leave.fromDate)}</td>
                                <td>{formatDate(leave.toDate)}</td>
                                <td>{leave.numberOfDays || "-"}</td>
                                <td>{leave.reason || "-"}</td>
                                <td>
                                  <span
                                    className={`status-badge ${getStatusClass(leave.status)}`}
                                  >
                                    {leave.status || "-"}
                                  </span>
                                </td>
                                <td>{leave.remarks || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {employeeLeaves.length > 10 && (
                      <div className="text-muted small mt-2">
                        Showing the latest 10 leave requests.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Payroll */}
            {isAdmin && (
              <div className="col-12">
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="mb-1">
                        <i className="bi bi-credit-card me-2"></i>
                        Payroll History
                      </h5>

                      <small className="text-muted">
                        Payroll processing and salary history for this employee
                      </small>
                    </div>
                  </div>

                  {payrollLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status"></div>

                      <p className="mt-2 mb-0 text-muted">
                        Loading payroll records...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="row g-3 mb-4">
                        <div className="col-md-4">
                          <div className="border rounded p-3 text-center">
                            <div className="text-muted small">
                              Payroll Records
                            </div>

                            <h4 className="mb-0 mt-1">
                              {payrollSummary.total}
                            </h4>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="border rounded p-3 text-center">
                            <div className="text-muted small">
                              Gross Processed
                            </div>

                            <h4 className="mb-0 mt-1">
                              ₹{formatCurrency(payrollSummary.totalGrossSalary)}
                            </h4>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="border rounded p-3 text-center">
                            <div className="text-muted small">
                              Net Processed
                            </div>

                            <h4 className="mb-0 mt-1 text-success">
                              ₹{formatCurrency(payrollSummary.totalNetSalary)}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {employeePayroll.length === 0 ? (
                        <div className="text-center py-3 text-muted">
                          <i className="bi bi-wallet2 fs-3 d-block mb-2"></i>
                          No payroll records found for this employee.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-sm align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Period</th>
                                <th>Basic Salary</th>
                                <th>Allowances</th>
                                <th>Bonus</th>
                                <th>Deductions</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                              </tr>
                            </thead>

                            <tbody>
                              {employeePayroll.slice(0, 10).map((record) => (
                                <tr key={record._id}>
                                  <td>{getPayrollPeriod(record)}</td>

                                  <td>
                                    ₹
                                    {formatCurrency(
                                      getPayrollValue(
                                        record,
                                        [
                                          "basicSalary",
                                          "basicPay",
                                          "basicAmount",
                                        ],
                                        0,
                                      ),
                                    )}
                                  </td>

                                  <td>
                                    ₹
                                    {formatCurrency(
                                      getPayrollValue(
                                        record,
                                        [
                                          "allowances",
                                          "allowanceAmount",
                                          "totalAllowances",
                                        ],
                                        0,
                                      ),
                                    )}
                                  </td>

                                  <td>
                                    ₹
                                    {formatCurrency(
                                      getPayrollValue(
                                        record,
                                        ["bonus", "bonusAmount"],
                                        0,
                                      ),
                                    )}
                                  </td>

                                  <td>
                                    ₹
                                    {formatCurrency(
                                      getPayrollValue(
                                        record,
                                        [
                                          "deductions",
                                          "deductionAmount",
                                          "totalDeductions",
                                        ],
                                        0,
                                      ),
                                    )}
                                  </td>

                                  <td>
                                    <strong>
                                      ₹
                                      {formatCurrency(
                                        getPayrollValue(
                                          record,
                                          ["netSalary", "netPay", "netAmount"],
                                          0,
                                        ),
                                      )}
                                    </strong>
                                  </td>

                                  <td>
                                    <span
                                      className={`status-badge ${getStatusClass(
                                        getPayrollValue(
                                          record,
                                          ["status"],
                                          "Processed",
                                        ),
                                      )}`}
                                    >
                                      {getPayrollValue(
                                        record,
                                        ["status"],
                                        "Processed",
                                      )}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {employeePayroll.length > 10 && (
                        <div className="text-muted small mt-2">
                          Showing the latest 10 payroll records.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Detail Actions */}
            <div className="form-actions mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleEdit(selectedEmployee)}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Employee
              </button>

              {isAdmin && (
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleDelete(selectedEmployee)}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Employee
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Form */}
      <div className="card lawyer-form-card">
        <div className="card-header">
          <div>
            <h2>{editingId ? "Edit Employee" : "Add Employee"}</h2>

            <p>
              {editingId
                ? "Update employee employment and contact information."
                : "Create a new employee record for the firm."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Employee ID */}
            <div>
              <label className="form-label">Employee ID</label>

              <input
                type="text"
                name="employeeId"
                className="form-control"
                placeholder="EMP-2026-001"
                value={form.employeeId}
                onChange={handleChange}
              />
            </div>

            {/* User Account */}
            <div>
              <label className="form-label">User Account</label>

              <select
                name="userId"
                className="form-select"
                value={form.userId}
                onChange={handleChange}
              >
                <option value="">No linked account</option>

                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} — {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="form-label">Full Name</label>

              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Employee full name"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email</label>

              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="employee@peterlawfirm.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Phone</label>

              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="+381 60 000 0000"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            {/* Department */}
            <div>
              <label className="form-label">Department</label>

              <select
                name="department"
                className="form-select"
                value={form.department}
                onChange={handleChange}
              >
                <option value="Administration">Administration</option>

                <option value="Finance">Finance</option>

                <option value="Human Resources">Human Resources</option>

                <option value="Legal Support">Legal Support</option>

                <option value="IT">IT</option>

                <option value="Operations">Operations</option>

                <option value="Other">Other</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="form-label">Designation</label>

              <input
                type="text"
                name="designation"
                className="form-control"
                placeholder="Legal Assistant"
                value={form.designation}
                onChange={handleChange}
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="form-label">Joining Date</label>

              <input
                type="date"
                name="joiningDate"
                className="form-control"
                value={form.joiningDate}
                onChange={handleChange}
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="form-label">Employment Type</label>

              <select
                name="employmentType"
                className="form-select"
                value={form.employmentType}
                onChange={handleChange}
              >
                <option value="Full-Time">Full-Time</option>

                <option value="Part-Time">Part-Time</option>

                <option value="Contract">Contract</option>

                <option value="Intern">Intern</option>
              </select>
            </div>

            {/* Reporting Manager */}
            <div>
              <label className="form-label">Reporting Manager</label>

              <input
                type="text"
                name="reportingManager"
                className="form-control"
                placeholder="Department manager"
                value={form.reportingManager}
                onChange={handleChange}
              />
            </div>

            {/* Salary */}
            <div>
              <label className="form-label">Monthly Salary</label>

              <div className="input-group">
                <span className="input-group-text">₹</span>

                <input
                  type="number"
                  name="salary"
                  className="form-control"
                  min="0"
                  step="0.01"
                  placeholder="45000"
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="form-label">Employment Status</label>

              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>

                <option value="On Leave">On Leave</option>

                <option value="Resigned">Resigned</option>

                <option value="Terminated">Terminated</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-grid-full">
              <label className="form-label">Address</label>

              <textarea
                name="address"
                className="form-control"
                rows="2"
                placeholder="Employee residential address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="form-grid-full">
              <label className="form-label">Notes</label>

              <textarea
                name="notes"
                className="form-control"
                rows="3"
                placeholder="Additional employment notes"
                value={form.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>

                  {editingId ? "Update Employee" : "Add Employee"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Employee Register */}
      <div className="card">
        {/* Search and Filters */}
        <div className="card-body border-bottom">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-5">
              <label className="form-label">Search Employees</label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Name, employee ID or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Department */}
            <div className="col-md-3">
              <label className="form-label">Department</label>

              <select
                className="form-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>

                <option value="Administration">Administration</option>

                <option value="Finance">Finance</option>

                <option value="Human Resources">Human Resources</option>

                <option value="Legal Support">Legal Support</option>

                <option value="IT">IT</option>

                <option value="Operations">Operations</option>

                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-md-3">
              <label className="form-label">Employment Status</label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>

                <option value="Active">Active</option>

                <option value="On Leave">On Leave</option>

                <option value="Resigned">Resigned</option>

                <option value="Terminated">Terminated</option>
              </select>
            </div>

            {/* Clear */}
            <div className="col-md-1 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                title="Clear filters"
                onClick={clearFilters}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Register Header */}
        <div className="card-header">
          <div>
            <h2>Employee Register</h2>

            <p>
              {filteredEmployees.length} of {employees.length} employee
              {employees.length !== 1 ? "s" : ""} shown
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner-border" role="status"></div>

            <p className="mt-3">Loading employee records...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-people"></i>

            <h3>No employee records</h3>

            <p>Employee records created from the form will appear here.</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search"></i>

            <h3>No matching employees</h3>

            <p>Try changing your search or filters.</p>

            <button
              type="button"
              className="btn btn-outline-secondary mt-2"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Employment</th>
                  <th>Joining Date</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    {/* Employee */}
                    <td>
                      <div className="table-primary-text">
                        {employee.fullName}
                      </div>

                      <div className="table-secondary-text">
                        {employee.employeeId}
                      </div>

                      <div className="table-secondary-text">
                        {employee.email}
                      </div>
                    </td>

                    {/* Department */}
                    <td>{employee.department}</td>

                    {/* Designation */}
                    <td>{employee.designation}</td>

                    {/* Employment */}
                    <td>{employee.employmentType}</td>

                    {/* Joining */}
                    <td>{formatDate(employee.joiningDate)}</td>

                    {/* Salary */}
                    <td>
                      <strong>₹{formatCurrency(employee.salary)}</strong>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          employee.status,
                        )}`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions">
                        {/* View */}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          title="View employee"
                          onClick={() => handleView(employee)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Edit employee"
                          onClick={() => handleEdit(employee)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        {/* Delete */}
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete employee"
                            onClick={() => handleDelete(employee._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Employees;
