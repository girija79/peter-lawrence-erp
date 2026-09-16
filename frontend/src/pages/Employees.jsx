
import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const initialForm = {
  employeeId: '',
  userId: '',
  fullName: '',
  email: '',
  phone: '',
  department: 'Operations',
  designation: '',
  joiningDate: '',
  employmentType: 'Full-Time',
  reportingManager: '',
  address: '',
  salary: '',
  status: 'Active',
  notes: ''
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [employeesRes, usersRes] = await Promise.all([
        api.get('/employees'),
        api.get('/users')
      ]);

      setEmployees(employeesRes.data);

      // Employee accounts should normally use the employee role.
      setUsers(
        usersRes.data.filter((user) => user.role === 'employee')
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load employee data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.status === 'Active'
      ).length,
    [employees]
  );

  const onLeaveEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.status === 'On Leave'
      ).length,
    [employees]
  );

  const totalPayroll = useMemo(
    () =>
      employees
        .filter((employee) => employee.status !== 'Terminated')
        .reduce(
          (sum, employee) =>
            sum + Number(employee.salary || 0),
          0
        ),
    [employees]
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  };

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!form.employeeId.trim()) {
        setError('Employee ID is required.');
        return;
      }

      if (!form.fullName.trim()) {
        setError('Full name is required.');
        return;
      }

      if (!form.email.trim()) {
        setError('Email is required.');
        return;
      }

      if (!form.designation.trim()) {
        setError('Designation is required.');
        return;
      }

      if (!form.joiningDate) {
        setError('Joining date is required.');
        return;
      }

      if (form.salary && Number(form.salary) < 0) {
        setError('Salary cannot be negative.');
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
        notes: form.notes.trim()
      };

      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
        setSuccess('Employee updated successfully.');
      } else {
        await api.post('/employees', payload);
        setSuccess('Employee added successfully.');
      }

      resetForm();
      setSuccess(
        editingId
          ? 'Employee updated successfully.'
          : 'Employee added successfully.'
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to save employee.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee._id);

    setForm({
      employeeId: employee.employeeId || '',
      userId: employee.userId?._id || '',
      fullName: employee.fullName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || 'Operations',
      designation: employee.designation || '',
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate)
            .toISOString()
            .split('T')[0]
        : '',
      employmentType:
        employee.employmentType || 'Full-Time',
      reportingManager: employee.reportingManager || '',
      address: employee.address || '',
      salary: employee.salary || '',
      status: employee.status || 'Active',
      notes: employee.notes || ''
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this employee record?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(`/employees/${employeeId}`);

      if (editingId === employeeId) {
        resetForm();
      }

      setSuccess('Employee deleted successfully.');

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to delete employee.'
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-active';

      case 'On Leave':
        return 'status-warning';

      case 'Resigned':
      case 'Terminated':
        return 'status-inactive';

      default:
        return 'status-neutral';
    }
  };

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="eyebrow">
            Administration / Workforce
          </p>

          <h1>Employees</h1>

          <p className="page-description">
            Maintain employee records, employment details,
            organisational assignments and workforce status.
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
          <div className="summary-label">
            Total Employees
          </div>

          <div className="summary-value">
            {employees.length}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Active Employees
          </div>

          <div className="summary-value">
            {activeEmployees}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            On Leave
          </div>

          <div className="summary-value">
            {onLeaveEmployees}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Monthly Payroll
          </div>

          <div className="summary-value">
            ₹{formatCurrency(totalPayroll)}
          </div>
        </div>

      </div>

      {/* Employee Form */}
      <div className="card lawyer-form-card">

        <div className="card-header">
          <div>
            <h2>
              {editingId
                ? 'Edit Employee'
                : 'Add Employee'}
            </h2>

            <p>
              {editingId
                ? 'Update employee employment and contact information.'
                : 'Create a new employee record for the firm.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            {/* Employee ID */}
            <div>
              <label className="form-label">
                Employee ID
              </label>

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
              <label className="form-label">
                User Account
              </label>

              <select
                name="userId"
                className="form-select"
                value={form.userId}
                onChange={handleChange}
              >
                <option value="">
                  No linked account
                </option>

                {users.map((user) => (
                  <option
                    key={user._id}
                    value={user._id}
                  >
                    {user.name} — {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="form-label">
                Full Name
              </label>

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
              <label className="form-label">
                Email
              </label>

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
              <label className="form-label">
                Phone
              </label>

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
              <label className="form-label">
                Department
              </label>

              <select
                name="department"
                className="form-select"
                value={form.department}
                onChange={handleChange}
              >
                <option value="Administration">
                  Administration
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="Human Resources">
                  Human Resources
                </option>

                <option value="Legal Support">
                  Legal Support
                </option>

                <option value="IT">
                  IT
                </option>

                <option value="Operations">
                  Operations
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="form-label">
                Designation
              </label>

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
              <label className="form-label">
                Joining Date
              </label>

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
              <label className="form-label">
                Employment Type
              </label>

              <select
                name="employmentType"
                className="form-select"
                value={form.employmentType}
                onChange={handleChange}
              >
                <option value="Full-Time">
                  Full-Time
                </option>

                <option value="Part-Time">
                  Part-Time
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Intern">
                  Intern
                </option>
              </select>
            </div>

            {/* Reporting Manager */}
            <div>
              <label className="form-label">
                Reporting Manager
              </label>

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
              <label className="form-label">
                Monthly Salary
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  ₹
                </span>

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
              <label className="form-label">
                Employment Status
              </label>

              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">
                  Active
                </option>

                <option value="On Leave">
                  On Leave
                </option>

                <option value="Resigned">
                  Resigned
                </option>

                <option value="Terminated">
                  Terminated
                </option>
              </select>
            </div>

            {/* Address */}
            <div className="form-grid-full">
              <label className="form-label">
                Address
              </label>

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
              <label className="form-label">
                Notes
              </label>

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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>

                  {editingId
                    ? 'Update Employee'
                    : 'Add Employee'}
                </>
              )}
            </button>

          </div>

        </form>
      </div>

      {/* Employee Register */}
      <div className="card">

        <div className="card-header">
          <div>
            <h2>Employee Register</h2>

            <p>
              {employees.length} employee
              {employees.length !== 1 ? 's' : ''}
              {' '}registered
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">

            <div
              className="spinner-border"
              role="status"
            ></div>

            <p className="mt-3">
              Loading employee records...
            </p>

          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">

            <i className="bi bi-people"></i>

            <h3>
              No employee records
            </h3>

            <p>
              Employee records created from the form
              will appear here.
            </p>

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

                {employees.map((employee) => (
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
                    <td>
                      {employee.department}
                    </td>

                    {/* Designation */}
                    <td>
                      {employee.designation}
                    </td>

                    {/* Employment */}
                    <td>
                      {employee.employmentType}
                    </td>

                    {/* Joining */}
                    <td>
                      {formatDate(
                        employee.joiningDate
                      )}
                    </td>

                    {/* Salary */}
                    <td>
                      <strong>
                        ₹{formatCurrency(employee.salary)}
                      </strong>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          employee.status
                        )}`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="table-actions">

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Edit employee"
                          onClick={() =>
                            handleEdit(employee)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          title="Delete employee"
                          onClick={() =>
                            handleDelete(employee._id)
                          }
                        >
                          <i className="bi bi-trash"></i>
                        </button>

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
