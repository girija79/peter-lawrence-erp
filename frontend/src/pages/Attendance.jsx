import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const initialForm = {
  employeeId: '',
  attendanceDate: new Date().toISOString().split('T')[0],
  checkIn: '',
  checkOut: '',
  status: 'Present',
  remarks: ''
};

const formatDate = (date) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [attendanceRes, employeesRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/employees')
      ]);

      setAttendance(attendanceRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load attendance data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

    if (!form.employeeId || !form.attendanceDate) {
      setError('Employee and attendance date are required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingId) {
        await api.put(`/attendance/${editingId}`, form);
        setSuccess('Attendance record updated successfully.');
      } else {
        await api.post('/attendance', form);
        setSuccess('Attendance record created successfully.');
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save attendance record.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id);

    setForm({
      employeeId: record.employeeId?._id || '',
      attendanceDate: record.attendanceDate
        ? new Date(record.attendanceDate)
            .toISOString()
            .split('T')[0]
        : '',
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
      status: record.status || 'Present',
      remarks: record.remarks || ''
    });

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this attendance record?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(`/attendance/${id}`);

      setSuccess('Attendance record deleted successfully.');

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete attendance record.'
      );
    }
  };

  const filteredAttendance = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return attendance.filter((record) => {
      const employee = record.employeeId;

      const matchesSearch =
        !searchText ||
        employee?.fullName?.toLowerCase().includes(searchText) ||
        employee?.employeeId?.toLowerCase().includes(searchText) ||
        employee?.department?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === 'All' ||
        record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [attendance, search, statusFilter]);

  const totalRecords = attendance.length;

  const presentCount = attendance.filter(
    (item) => item.status === 'Present'
  ).length;

  const absentCount = attendance.filter(
    (item) => item.status === 'Absent'
  ).length;

  const leaveCount = attendance.filter(
    (item) => item.status === 'Leave'
  ).length;

  return (
    <div className="page-container attendance-page">
      <div className="page-header">
        <div>
          <div className="page-kicker">Employee Management</div>

          <h1>Attendance</h1>

          <p>
            Maintain daily employee attendance, working hours
            and attendance records.
          </p>
        </div>

        <div className="page-header-meta">
          <span>Peter Law Firm</span>
          <span>HR &amp; Operations</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger editorial-alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success editorial-alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-label">
            Attendance Records
          </div>

          <div className="summary-card-value">
            {totalRecords}
          </div>

          <div className="summary-card-note">
            Total recorded entries
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Present
          </div>

          <div className="summary-card-value">
            {presentCount}
          </div>

          <div className="summary-card-note">
            Employees marked present
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Absent
          </div>

          <div className="summary-card-value">
            {absentCount}
          </div>

          <div className="summary-card-note">
            Employees marked absent
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Leave
          </div>

          <div className="summary-card-value">
            {leaveCount}
          </div>

          <div className="summary-card-note">
            Attendance marked as leave
          </div>
        </div>
      </div>

      <div className="editorial-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              {editingId ? 'Edit Record' : 'Daily Record'}
            </span>

            <h2>
              {editingId
                ? 'Update Attendance'
                : 'Record Attendance'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="employeeId">
                Employee <span>*</span>
              </label>

              <select
                id="employeeId"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                required
              >
                <option value="">Select employee</option>

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
              <label htmlFor="attendanceDate">
                Attendance Date <span>*</span>
              </label>

              <input
                id="attendanceDate"
                type="date"
                name="attendanceDate"
                value={form.attendanceDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="checkIn">
                Check In
              </label>

              <input
                id="checkIn"
                type="time"
                name="checkIn"
                value={form.checkIn}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="checkOut">
                Check Out
              </label>

              <input
                id="checkOut"
                type="time"
                name="checkOut"
                value={form.checkOut}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="status">
                Attendance Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            <div className="form-field form-field-wide">
              <label htmlFor="remarks">
                Remarks
              </label>

              <textarea
                id="remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows="3"
                placeholder="Add an optional attendance note..."
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Saving...
                </>
              ) : (
                <>
                  <i
                    className={`bi ${
                      editingId
                        ? 'bi-check-lg'
                        : 'bi-plus-lg'
                    } me-2`}
                  ></i>

                  {editingId
                    ? 'Update Attendance'
                    : 'Record Attendance'}
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="editorial-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">
              Attendance Register
            </span>

            <h2>Attendance Records</h2>
          </div>

          <div className="section-count">
            {filteredAttendance.length} record
            {filteredAttendance.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="table-toolbar">
          <div className="toolbar-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search employee, ID or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filter">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner-border"></div>

            <h3>Loading attendance records</h3>

            <p>Please wait while the register is loaded.</p>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar-check"></i>

            <h3>No attendance records</h3>

            <p>
              Record employee attendance using the form above.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table editorial-table align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div className="table-primary-text">
                        {record.employeeId?.fullName || '-'}
                      </div>

                      <div className="table-secondary-text">
                        {record.employeeId?.employeeId || '-'}
                      </div>
                    </td>

                    <td>
                      {formatDate(record.attendanceDate)}
                    </td>

                    <td>
                      {record.checkIn || '—'}
                    </td>

                    <td>
                      {record.checkOut || '—'}
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${record.status
                          ?.toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>
                      <span className="table-secondary-text">
                        {record.remarks || '—'}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          title="Edit attendance"
                          onClick={() => handleEdit(record)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Delete attendance"
                          onClick={() =>
                            handleDelete(record._id)
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
};

export default Attendance;