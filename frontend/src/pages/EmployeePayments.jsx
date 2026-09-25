import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const EmployeePayments = () => {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === "admin";
  const isAccountant = user?.role === "accountant";
  const isEmployee = user?.role === "employee";

  const canManage = isAdmin || isAccountant;

  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formData, setFormData] = useState({
    paymentNumber: "",
    employeeId: "",
    payrollId: "",
    paymentDate: "",
    amount: "",
    paymentMethod: "Bank Transfer",
    transactionReference: "",
    paymentStatus: "Pending",
    remarks: "",
  });

  useEffect(() => {
    fetchPayments();

    if (canManage) {
      fetchEmployees();
      fetchPayrolls();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/employee-payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch employee payments"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const res = await api.get("/payroll");
      setPayrolls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      paymentNumber: "",
      employeeId: "",
      payrollId: "",
      paymentDate: "",
      amount: "",
      paymentMethod: "Bank Transfer",
      transactionReference: "",
      paymentStatus: "Pending",
      remarks: "",
    });

    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;

    setFormData({
      ...formData,
      employeeId,
      payrollId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (editingId) {
        await api.put(
          `/employee-payments/${editingId}`,
          formData
        );
      } else {
        await api.post("/employee-payments", formData);
      }

      await fetchPayments();

      if (canManage) {
        await fetchPayrolls();
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to save employee payment"
      );
    }
  };

  const handleEdit = (payment) => {
    setEditingId(payment._id);

    setFormData({
      paymentNumber: payment.paymentNumber || "",
      employeeId: payment.employeeId?._id || payment.employeeId || "",
      payrollId: payment.payrollId?._id || payment.payrollId || "",
      paymentDate: payment.paymentDate
        ? payment.paymentDate.split("T")[0]
        : "",
      amount: payment.amount ?? "",
      paymentMethod: payment.paymentMethod || "Bank Transfer",
      transactionReference:
        payment.transactionReference || "",
      paymentStatus: payment.paymentStatus || "Pending",
      remarks: payment.remarks || "",
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee payment?")) {
      return;
    }

    try {
      await api.delete(`/employee-payments/${id}`);
      await fetchPayments();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to delete employee payment"
      );
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const employeeName =
      payment.employeeId?.fullName || "";

    const paymentNumber =
      payment.paymentNumber || "";

    const reference =
      payment.transactionReference || "";

    const matchesSearch =
      employeeName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      paymentNumber
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      reference
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      payment.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const completedAmount = filteredPayments
    .filter(
      (payment) =>
        payment.paymentStatus === "Completed"
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

  const pendingAmount = filteredPayments
    .filter(
      (payment) =>
        payment.paymentStatus === "Pending"
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

  const employeePayrolls = payrolls.filter((payroll) => {
    const selectedEmployee =
      formData.employeeId;

    const payrollEmployeeId =
      payroll.employeeId?._id ||
      payroll.employeeId;

    return payrollEmployeeId === selectedEmployee;
  });

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            {isEmployee
              ? "My Employee Payments"
              : "Employee Payments"}
          </h2>

          <p className="text-muted mb-0">
            {isEmployee
              ? "View your salary payment records"
              : "Manage employee salary payment records"}
          </p>
        </div>

        {canManage && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Payment
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Payments
              </small>

              <h4 className="fw-bold mt-2">
                {filteredPayments.length}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Amount
              </small>

              <h4 className="fw-bold mt-2">
                € {totalAmount.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <small className="text-muted">
                Completed Amount
              </small>

              <h4 className="fw-bold mt-2 text-success">
                € {completedAmount.toLocaleString()}
              </h4>

              <small className="text-muted">
                Pending: € {pendingAmount.toLocaleString()}
              </small>
            </div>
          </div>
        </div>

      </div>

      {/* Search / Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">

          <div className="row g-3">

            <div className="col-md-8">
              <label className="form-label">
                Search
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search payment number, employee or transaction reference..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Payment Status
              </label>

              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="">
                  All Statuses
                </option>
                <option value="Pending">
                  Pending
                </option>
                <option value="Processing">
                  Processing
                </option>
                <option value="Completed">
                  Completed
                </option>
                <option value="Failed">
                  Failed
                </option>
                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Form */}
      {showForm && canManage && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">
              {editingId
                ? "Edit Employee Payment"
                : "Add Employee Payment"}
            </h5>
          </div>

          <div className="card-body">

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                <div className="col-md-4">
                  <label className="form-label">
                    Payment Number
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="paymentNumber"
                    value={formData.paymentNumber}
                    onChange={handleChange}
                    placeholder="EP-2026-001"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Employee
                  </label>

                  <select
                    className="form-select"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleEmployeeChange}
                    required
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee._id}
                        value={employee._id}
                      >
                        {employee.fullName} (
                        {employee.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Payroll
                  </label>

                  <select
                    className="form-select"
                    name="payrollId"
                    value={formData.payrollId}
                    onChange={handleChange}
                  >
                    <option value="">
                      No Payroll Linked
                    </option>

                    {employeePayrolls.map((payroll) => (
                      <option
                        key={payroll._id}
                        value={payroll._id}
                      >
                        {payroll.payrollNumber} -{" "}
                        {payroll.salaryMonth}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Payment Date
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Amount
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Payment Method
                  </label>

                  <select
                    className="form-select"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                    <option value="Cash">
                      Cash
                    </option>
                    <option value="Cheque">
                      Cheque
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Transaction Reference
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="transactionReference"
                    value={
                      formData.transactionReference
                    }
                    onChange={handleChange}
                    placeholder="Transaction / cheque reference"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Payment Status
                  </label>

                  <select
                    className="form-select"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Processing">
                      Processing
                    </option>
                    <option value="Completed">
                      Completed
                    </option>
                    <option value="Failed">
                      Failed
                    </option>
                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Remarks
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Optional remarks"
                  />
                </div>

              </div>

              <div className="mt-4 d-flex gap-2">

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <i className="bi bi-check-lg me-2"></i>
                  {editingId
                    ? "Update Payment"
                    : "Save Payment"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* Table */}
      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            Payment Records
          </h5>
        </div>

        <div className="card-body p-0">

          {loading ? (
            <div className="p-4 text-center">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-4 text-center text-muted">
              No employee payment records found.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Payment No.</th>

                    {!isEmployee && (
                      <th>Employee</th>
                    )}

                    <th>Payment Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Reference</th>

                    {canManage && (
                      <th>Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>

                  {filteredPayments.map((payment) => (

                    <tr key={payment._id}>

                      <td className="fw-semibold">
                        {payment.paymentNumber}
                      </td>

                      {!isEmployee && (
                        <td>
                          <div>
                            {payment.employeeId?.fullName ||
                              "—"}
                          </div>

                          <small className="text-muted">
                            {payment.employeeId?.employeeId ||
                              ""}
                          </small>
                        </td>
                      )}

                      <td>
                        {payment.paymentDate
                          ? new Date(
                              payment.paymentDate
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="fw-semibold">
                        €{" "}
                        {Number(
                          payment.amount || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        {payment.paymentMethod}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            payment.paymentStatus ===
                            "Completed"
                              ? "bg-success"
                              : payment.paymentStatus ===
                                "Pending"
                              ? "bg-warning text-dark"
                              : payment.paymentStatus ===
                                "Failed"
                              ? "bg-danger"
                              : payment.paymentStatus ===
                                "Cancelled"
                              ? "bg-secondary"
                              : "bg-info"
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>

                      <td>
                        {payment.transactionReference ||
                          "—"}
                      </td>

                      {canManage && (
                        <td>

                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              handleEdit(payment)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDelete(
                                  payment._id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}

                        </td>
                      )}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default EmployeePayments;