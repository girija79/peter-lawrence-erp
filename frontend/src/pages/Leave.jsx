import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const initialForm = {
  employeeId: '',
  leaveType: 'Casual Leave',
  fromDate: '',
  toDate: '',
  reason: '',
  status: 'Pending',
  remarks: ''
};

const leaveTypes = [
  'Casual Leave',
  'Sick Leave',
  'Annual Leave',
  'Emergency Leave',
  'Other'
];

const statuses = [
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled'
];

function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [leavesResponse, employeesResponse] = await Promise.all([
        api.get('/leaves'),
        api.get('/employees')
      ]);

      setLeaves(leavesResponse.data || []);
      setEmployees(employeesResponse.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load leave records.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!form.employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (!form.fromDate || !form.toDate) {
      setError('Please select both from and to dates.');
      return;
    }

    if (new Date(form.toDate) < new Date(form.fromDate)) {
      setError('To date cannot be before from date.');
      return;
    }

    if (!form.reason.trim()) {
      setError('Please enter a reason for the leave.');
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/leaves/${editingId}`, form);
        setSuccess('Leave record updated successfully.');
      } else {
        await api.post('/leaves', form);
        setSuccess('Leave request recorded successfully.');
      }

      resetForm();
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to save leave record.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (leave) => {
    setEditingId(leave._id);

    setForm({
      employeeId: leave.employeeId?._id || leave.employeeId || '',
      leaveType: leave.leaveType || 'Casual Leave',
      fromDate: leave.fromDate
        ? new Date(leave.fromDate).toISOString().split('T')[0]
        : '',
      toDate: leave.toDate
        ? new Date(leave.toDate).toISOString().split('T')[0]
        : '',
      reason: leave.reason || '',
      status: leave.status || 'Pending',
      remarks: leave.remarks || ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this leave record?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(`/leaves/${id}`);

      setSuccess('Leave record deleted successfully.');

      if (editingId === id) {
        resetForm();
      }

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to delete leave record.'
      );
    }
  };

  const filteredLeaves = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return leaves.filter((leave) => {
      const employee = leave.employeeId || {};

      const matchesSearch =
        !searchValue ||
        employee.fullName?.toLowerCase().includes(searchValue) ||
        employee.employeeId?.toLowerCase().includes(searchValue) ||
        leave.leaveType?.toLowerCase().includes(searchValue) ||
        leave.reason?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === 'All' ||
        leave.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter(
        (leave) => leave.status === 'Pending'
      ).length,
      approved: leaves.filter(
        (leave) => leave.status === 'Approved'
      ).length,
      rejected: leaves.filter(
        (leave) => leave.status === 'Rejected'
      ).length
    };
  }, [leaves]);

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'status-approved';

      case 'Rejected':
        return 'status-rejected';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return 'status-pending';
    }
  };

  return (
    <div className="page-container leave-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            HUMAN RESOURCES
          </div>

          <h1>Leave Management</h1>

          <p>
            Manage employee leave requests, approvals and leave history.
          </p>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="editorial-alert editorial-alert-danger">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="editorial-alert editorial-alert-success">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {/* SUMMARY */}
      <div className="summary-grid leave-summary-grid">

        <div className="summary-card">
          <div className="summary-card-label">
            Total Requests
          </div>

          <div className="summary-card-value">
            {summary.total}
          </div>

          <div className="summary-card-note">
            All leave records
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Pending
          </div>

          <div className="summary-card-value">
            {summary.pending}
          </div>

          <div className="summary-card-note">
            Awaiting review
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Approved
          </div>

          <div className="summary-card-value">
            {summary.approved}
          </div>

          <div className="summary-card-note">
            Approved requests
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Rejected
          </div>

          <div className="summary-card-value">
            {summary.rejected}
          </div>

          <div className="summary-card-note">
            Rejected requests
          </div>
        </div>

      </div>

      {/* FORM */}
      <section className="editorial-section">

        <div className="section-heading">
          <div>
            <span className="section-kicker">
              {editingId ? 'UPDATE RECORD' : 'NEW REQUEST'}
            </span>

            <h2>
              {editingId
                ? 'Edit Leave Record'
                : 'Record Employee Leave'}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              className="btn-editorial-secondary"
              onClick={resetForm}
            >
              <i className="bi bi-x-lg"></i>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-field">
              <label>
                Employee <span>*</span>
              </label>

              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.employeeId} — {employee.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>
                Leave Type
              </label>

              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
              >
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>
                From Date <span>*</span>
              </label>

              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>
                To Date <span>*</span>
              </label>

              <input
                type="date"
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-full">
              <label>
                Reason <span>*</span>
              </label>

              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows="3"
                placeholder="Enter the reason for leave..."
                required
              />
            </div>

            <div className="form-field form-field-full">
              <label>
                Remarks
              </label>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows="2"
                placeholder="Optional administrative remarks..."
              />
            </div>

          </div>

          <div className="form-actions">

            <button
              type="submit"
              className="btn-editorial-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check2"></i>
                  {editingId
                    ? 'Update Leave'
                    : 'Record Leave'}
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn-editorial-secondary"
                onClick={resetForm}
              >
                Clear
              </button>
            )}

          </div>

        </form>
      </section>

      {/* TABLE */}
      <section className="editorial-section">

        <div className="section-heading">
          <div>
            <span className="section-kicker">
              LEAVE REGISTER
            </span>

            <h2>
              Employee Leave Records
            </h2>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="table-toolbar">

          <div className="table-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search employee, ID, leave type or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-filter">
            <label>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">
                All
              </option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner-border"></div>

            <h3>Loading leave records</h3>

            <p>
              Please wait while the records are being loaded.
            </p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar2-x"></i>

            <h3>No leave records found</h3>

            <p>
              No records match the current search or filter.
            </p>
          </div>
        ) : (
          <div className="table-responsive">

            <table className="table editorial-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewed</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredLeaves.map((leave) => {

                  const employee = leave.employeeId || {};
                  const reviewer = leave.reviewedBy || {};

                  return (
                    <tr key={leave._id}>

                      <td>
                        <div className="table-primary-text">
                          {employee.fullName || 'Unknown Employee'}
                        </div>

                        <div className="table-secondary-text">
                          {employee.employeeId || '—'}
                        </div>
                      </td>

                      <td>
                        {leave.leaveType}
                      </td>

                      <td>
                        <div className="table-primary-text">
                          {formatDate(leave.fromDate)}
                        </div>

                        <div className="table-secondary-text">
                          to {formatDate(leave.toDate)}
                        </div>
                      </td>

                      <td>
                        <strong>
                          {leave.numberOfDays || 0}
                        </strong>
                      </td>

                      <td>
                        <div className="leave-reason">
                          {leave.reason || '—'}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td>
                        {leave.reviewedBy ? (
                          <>
                            <div className="table-primary-text">
                              {reviewer.name || 'Admin'}
                            </div>

                            <div className="table-secondary-text">
                              {formatDate(leave.reviewDate)}
                            </div>
                          </>
                        ) : (
                          <span className="table-secondary-text">
                            Pending review
                          </span>
                        )}
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            className="btn-table-action"
                            title="Edit leave"
                            onClick={() => handleEdit(leave)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn-table-action btn-table-danger"
                            title="Delete leave"
                            onClick={() =>
                              handleDelete(leave._id)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default Leave;