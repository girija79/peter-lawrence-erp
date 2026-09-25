import { useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const LeaveBalance = () => {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    casualLeave: 12,
    sickLeave: 12,
    annualLeave: 20,
    emergencyLeave: 5,
    casualLeaveUsed: 0,
    sickLeaveUsed: 0,
    annualLeaveUsed: 0,
    emergencyLeaveUsed: 0,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (isEmployee) {
      fetchMyBalance();
    } else if (isAdmin) {
      fetchBalances();
      fetchEmployees();
    }
  }, [user]);

  // Employee
  const fetchMyBalance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/leave-balances/me");

      setBalances([res.data]);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch your leave balance"
      );
    } finally {
      setLoading(false);
    }
  };

  // Admin
  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/leave-balances");

      setBalances(res.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch leave balances"
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

  const resetForm = () => {
    setFormData({
      employeeId: "",
      casualLeave: 12,
      sickLeave: 12,
      annualLeave: 20,
      emergencyLeave: 5,
      casualLeaveUsed: 0,
      sickLeaveUsed: 0,
      annualLeaveUsed: 0,
      emergencyLeaveUsed: 0,
      year: new Date().getFullYear(),
    });

    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        ...formData,
        casualLeave: Number(formData.casualLeave),
        sickLeave: Number(formData.sickLeave),
        annualLeave: Number(formData.annualLeave),
        emergencyLeave: Number(
          formData.emergencyLeave
        ),
        casualLeaveUsed: Number(
          formData.casualLeaveUsed
        ),
        sickLeaveUsed: Number(
          formData.sickLeaveUsed
        ),
        annualLeaveUsed: Number(
          formData.annualLeaveUsed
        ),
        emergencyLeaveUsed: Number(
          formData.emergencyLeaveUsed
        ),
        year: Number(formData.year),
      };

      if (editingId) {
        await api.put(
          `/leave-balances/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/leave-balances",
          payload
        );
      }

      await fetchBalances();

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to save leave balance"
      );
    }
  };

  const handleEdit = (balance) => {
    setEditingId(balance._id);

    setFormData({
      employeeId:
        balance.employeeId?._id ||
        balance.employeeId ||
        "",
      casualLeave: balance.casualLeave ?? 12,
      sickLeave: balance.sickLeave ?? 12,
      annualLeave: balance.annualLeave ?? 20,
      emergencyLeave:
        balance.emergencyLeave ?? 5,
      casualLeaveUsed:
        balance.casualLeaveUsed ?? 0,
      sickLeaveUsed:
        balance.sickLeaveUsed ?? 0,
      annualLeaveUsed:
        balance.annualLeaveUsed ?? 0,
      emergencyLeaveUsed:
        balance.emergencyLeaveUsed ?? 0,
      year:
        balance.year ||
        new Date().getFullYear(),
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this leave balance?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/leave-balances/${id}`
      );

      await fetchBalances();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to delete leave balance"
      );
    }
  };

  const getRemaining = (total, used) => {
    return Math.max(
      Number(total || 0) -
        Number(used || 0),
      0
    );
  };

  const getBalancePercentage = (
    total,
    used
  ) => {
    const totalNumber = Number(total || 0);

    if (totalNumber === 0) {
      return 0;
    }

    const remaining = getRemaining(
      total,
      used
    );

    return Math.round(
      (remaining / totalNumber) * 100
    );
  };

  return (
    <div className="container-fluid py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            {isEmployee
              ? "My Leave Balance"
              : "Leave Balance Management"}
          </h2>

          <p className="text-muted mb-0">
            {isEmployee
              ? "View your available and used leave"
              : "Manage employee annual leave balances"}
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Leave Balance
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Employee View */}
      {isEmployee && !loading && balances.length > 0 && (
        <>
          {balances.map((balance) => (
            <div
              className="row g-4"
              key={balance._id}
            >

              {/* Casual */}
              <div className="col-md-6 col-xl-3">
                <LeaveCard
                  title="Casual Leave"
                  icon="bi-calendar-check"
                  total={balance.casualLeave}
                  used={balance.casualLeaveUsed}
                  remaining={getRemaining(
                    balance.casualLeave,
                    balance.casualLeaveUsed
                  )}
                  percentage={getBalancePercentage(
                    balance.casualLeave,
                    balance.casualLeaveUsed
                  )}
                />
              </div>

              {/* Sick */}
              <div className="col-md-6 col-xl-3">
                <LeaveCard
                  title="Sick Leave"
                  icon="bi-heart-pulse"
                  total={balance.sickLeave}
                  used={balance.sickLeaveUsed}
                  remaining={getRemaining(
                    balance.sickLeave,
                    balance.sickLeaveUsed
                  )}
                  percentage={getBalancePercentage(
                    balance.sickLeave,
                    balance.sickLeaveUsed
                  )}
                />
              </div>

              {/* Annual */}
              <div className="col-md-6 col-xl-3">
                <LeaveCard
                  title="Annual Leave"
                  icon="bi-calendar3"
                  total={balance.annualLeave}
                  used={balance.annualLeaveUsed}
                  remaining={getRemaining(
                    balance.annualLeave,
                    balance.annualLeaveUsed
                  )}
                  percentage={getBalancePercentage(
                    balance.annualLeave,
                    balance.annualLeaveUsed
                  )}
                />
              </div>

              {/* Emergency */}
              <div className="col-md-6 col-xl-3">
                <LeaveCard
                  title="Emergency Leave"
                  icon="bi-exclamation-circle"
                  total={balance.emergencyLeave}
                  used={balance.emergencyLeaveUsed}
                  remaining={getRemaining(
                    balance.emergencyLeave,
                    balance.emergencyLeaveUsed
                  )}
                  percentage={getBalancePercentage(
                    balance.emergencyLeave,
                    balance.emergencyLeaveUsed
                  )}
                />
              </div>

              {/* Employee Information */}
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="fw-bold mb-1">
                          {balance.employeeId?.fullName}
                        </h5>

                        <p className="text-muted mb-0">
                          {balance.employeeId?.employeeId} •{" "}
                          {balance.employeeId?.department} •{" "}
                          {balance.employeeId?.designation}
                        </p>
                      </div>

                      <span className="badge bg-primary">
                        {balance.year}
                      </span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          ))}
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>
        </div>
      )}

      {/* Admin Form */}
      {isAdmin && showForm && (
        <div className="card border-0 shadow-sm mb-4">

          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">
              {editingId
                ? "Edit Leave Balance"
                : "Add Leave Balance"}
            </h5>
          </div>

          <div className="card-body">

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                {/* Employee */}
                <div className="col-md-6">
                  <label className="form-label">
                    Employee
                  </label>

                  <select
                    className="form-select"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
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

                {/* Year */}
                <div className="col-md-6">
                  <label className="form-label">
                    Year
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2020"
                    max="2100"
                    required
                    disabled={!!editingId}
                  />
                </div>

                {/* Casual */}
                <div className="col-md-3">
                  <label className="form-label">
                    Casual Leave
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="casualLeave"
                    value={formData.casualLeave}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Casual Used
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="casualLeaveUsed"
                    value={
                      formData.casualLeaveUsed
                    }
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                {/* Sick */}
                <div className="col-md-3">
                  <label className="form-label">
                    Sick Leave
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="sickLeave"
                    value={formData.sickLeave}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Sick Used
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="sickLeaveUsed"
                    value={
                      formData.sickLeaveUsed
                    }
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                {/* Annual */}
                <div className="col-md-3">
                  <label className="form-label">
                    Annual Leave
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="annualLeave"
                    value={formData.annualLeave}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Annual Used
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="annualLeaveUsed"
                    value={
                      formData.annualLeaveUsed
                    }
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                {/* Emergency */}
                <div className="col-md-3">
                  <label className="form-label">
                    Emergency Leave
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="emergencyLeave"
                    value={
                      formData.emergencyLeave
                    }
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Emergency Used
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="emergencyLeaveUsed"
                    value={
                      formData.emergencyLeaveUsed
                    }
                    onChange={handleChange}
                    min="0"
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
                    ? "Update Balance"
                    : "Save Balance"}
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

      {/* Admin Table */}
      {isAdmin && !loading && (
        <div className="card border-0 shadow-sm">

          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">
              Employee Leave Balances
            </h5>
          </div>

          <div className="card-body p-0">

            {balances.length === 0 ? (
              <div className="p-4 text-center text-muted">
                No leave balances found.
              </div>
            ) : (
              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">
                    <tr>
                      <th>Employee</th>
                      <th>Year</th>
                      <th>Casual</th>
                      <th>Sick</th>
                      <th>Annual</th>
                      <th>Emergency</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {balances.map((balance) => (

                      <tr key={balance._id}>

                        <td>
                          <div className="fw-semibold">
                            {balance.employeeId?.fullName ||
                              "—"}
                          </div>

                          <small className="text-muted">
                            {balance.employeeId?.employeeId ||
                              ""}
                          </small>
                        </td>

                        <td>
                          {balance.year}
                        </td>

                        <td>
                          <strong>
                            {getRemaining(
                              balance.casualLeave,
                              balance.casualLeaveUsed
                            )}
                          </strong>

                          <small className="text-muted">
                            {" "}
                            / {balance.casualLeave}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {getRemaining(
                              balance.sickLeave,
                              balance.sickLeaveUsed
                            )}
                          </strong>

                          <small className="text-muted">
                            {" "}
                            / {balance.sickLeave}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {getRemaining(
                              balance.annualLeave,
                              balance.annualLeaveUsed
                            )}
                          </strong>

                          <small className="text-muted">
                            {" "}
                            / {balance.annualLeave}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {getRemaining(
                              balance.emergencyLeave,
                              balance.emergencyLeaveUsed
                            )}
                          </strong>

                          <small className="text-muted">
                            {" "}
                            / {balance.emergencyLeave}
                          </small>
                        </td>

                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() =>
                              handleEdit(balance)
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                balance._id
                              )
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

/* Leave balance card */
const LeaveCard = ({
  title,
  icon,
  total,
  used,
  remaining,
  percentage,
}) => {
  return (
    <div className="card border-0 shadow-sm h-100">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start">

          <div>
            <small className="text-muted">
              {title}
            </small>

            <h2 className="fw-bold mt-2 mb-0">
              {remaining}
            </h2>

            <small className="text-muted">
              {used} used of {total}
            </small>
          </div>

          <div className="fs-3 text-primary">
            <i className={`bi ${icon}`}></i>
          </div>

        </div>

        <div className="progress mt-4" style={{ height: "7px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${percentage}%`,
            }}
          ></div>
        </div>

        <small className="text-muted">
          {percentage}% remaining
        </small>

      </div>

    </div>
  );
};

export default LeaveBalance;