
import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const initialForm = {
  payrollNumber: '',
  employeeId: '',
  salaryMonth: '',
  basicSalary: '',
  bonus: '0',
  deductions: '0',
  paymentDate: '',
  paymentStatus: 'Pending',
  paymentMethod: 'Bank Transfer',
  notes: ''
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
};

const formatDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Paid':
      return 'status-paid';

    case 'Processed':
      return 'status-processed';

    case 'Pending':
      return 'status-pending';

    default:
      return 'status-neutral';
  }
};

const getMonthValue = (monthString) => {
  if (!monthString) return '';

  const date = new Date(`${monthString} 1, 2000`);

  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
};

export default function Payroll() {
  const { user } = useContext(AuthContext);

  const canManagePayroll =
    user?.role === 'admin' ||
    user?.role === 'accountant';

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // All allowed payroll users can access payroll records.
      const payrollResponse = await api.get('/payroll');

      setPayrolls(payrollResponse.data || []);

      // Only Admin and Accountant need the employee list
      // because only they can create/edit payroll.
      if (canManagePayroll) {
        const employeeResponse = await api.get('/employees');
        setEmployees(employeeResponse.data || []);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load payroll data.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!form.payrollNumber.trim()) {
      setError('Payroll number is required.');
      return;
    }

    if (!form.employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (!form.salaryMonth) {
      setError('Salary month is required.');
      return;
    }

    if (
      form.basicSalary === '' ||
      Number(form.basicSalary) < 0
    ) {
      setError('Please enter a valid basic salary.');
      return;
    }

    if (Number(form.bonus || 0) < 0) {
      setError('Bonus cannot be negative.');
      return;
    }

    if (Number(form.deductions || 0) < 0) {
      setError('Deductions cannot be negative.');
      return;
    }

    const basic = Number(form.basicSalary);
    const bonus = Number(form.bonus || 0);
    const deductions = Number(form.deductions || 0);

    const netSalary = basic + bonus - deductions;

    if (netSalary < 0) {
      setError(
        'Deductions cannot be greater than total earnings.'
      );
      return;
    }

    const payload = {
      payrollNumber: form.payrollNumber.trim(),
      employeeId: form.employeeId,
      salaryMonth: form.salaryMonth,
      basicSalary: basic,
      bonus,
      deductions,
      paymentDate: form.paymentDate || null,
      paymentStatus: form.paymentStatus,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim()
    };

    try {
      setSubmitting(true);

      if (editingId) {
        const response = await api.put(
          `/payroll/${editingId}`,
          payload
        );

        setPayrolls((previous) =>
          previous.map((item) =>
            item._id === editingId
              ? response.data.payroll
              : item
          )
        );

        setSuccess(
          'Payroll record updated successfully.'
        );
      } else {
        const response = await api.post(
          '/payroll',
          payload
        );

        setPayrolls((previous) => [
          response.data.payroll,
          ...previous
        ]);

        setSuccess(
          'Payroll record created successfully.'
        );
      }

      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to save payroll record.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (payroll) => {
    setError('');
    setSuccess('');

    setEditingId(payroll._id);

    setForm({
      payrollNumber: payroll.payrollNumber || '',
      employeeId:
        payroll.employeeId?._id ||
        payroll.employeeId ||
        '',
      salaryMonth: payroll.salaryMonth || '',
      basicSalary: payroll.basicSalary ?? '',
      bonus: payroll.bonus ?? '0',
      deductions: payroll.deductions ?? '0',
      paymentDate: payroll.paymentDate
        ? new Date(payroll.paymentDate)
            .toISOString()
            .split('T')[0]
        : '',
      paymentStatus:
        payroll.paymentStatus || 'Pending',
      paymentMethod:
        payroll.paymentMethod || 'Bank Transfer',
      notes: payroll.notes || ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this payroll record?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(`/payroll/${id}`);

      setPayrolls((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      setSuccess(
        'Payroll record deleted successfully.'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete payroll record.'
      );
    }
  };

  const basicSalary = Number(form.basicSalary || 0);
  const bonus = Number(form.bonus || 0);
  const deductions = Number(form.deductions || 0);

  const calculatedNetSalary =
    basicSalary + bonus - deductions;

  const filteredPayrolls = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return payrolls.filter((payroll) => {
      const employee = payroll.employeeId || {};

      const matchesSearch =
        !searchTerm ||
        payroll.payrollNumber
          ?.toLowerCase()
          .includes(searchTerm) ||
        payroll.salaryMonth
          ?.toLowerCase()
          .includes(searchTerm) ||
        employee.fullName
          ?.toLowerCase()
          .includes(searchTerm) ||
        employee.employeeId
          ?.toLowerCase()
          .includes(searchTerm) ||
        employee.department
          ?.toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        statusFilter === 'All' ||
        payroll.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payrolls, search, statusFilter]);

  const summary = useMemo(() => {
    const totalGross = payrolls.reduce(
      (sum, payroll) =>
        sum +
        Number(payroll.basicSalary || 0) +
        Number(payroll.bonus || 0),
      0
    );

    const totalDeductions = payrolls.reduce(
      (sum, payroll) =>
        sum + Number(payroll.deductions || 0),
      0
    );

    const totalNet = payrolls.reduce(
      (sum, payroll) =>
        sum + Number(payroll.netSalary || 0),
      0
    );

    const paid = payrolls.filter(
      (payroll) =>
        payroll.paymentStatus === 'Paid'
    ).length;

    const processed = payrolls.filter(
      (payroll) =>
        payroll.paymentStatus === 'Processed'
    ).length;

    const pending = payrolls.filter(
      (payroll) =>
        payroll.paymentStatus === 'Pending'
    ).length;

    return {
      totalGross,
      totalDeductions,
      totalNet,
      paid,
      processed,
      pending
    };
  }, [payrolls]);

  return (
    <div className="page-container payroll-page">

      {/* Page Header */}

      <div className="page-header">
        <div>
          <span className="eyebrow">
            FINANCE &amp; HUMAN RESOURCES
          </span>

          <h1>Employee Payroll</h1>

          <p>
            {canManagePayroll
              ? 'Process monthly salaries, bonuses, deductions and employee payments.'
              : 'View your salary, deductions and payment records.'}
          </p>
        </div>
      </div>

      {/* Alerts */}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="alert alert-success"
          role="alert"
        >
          {success}
        </div>
      )}

      {/* Summary */}

      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-label">
            Payroll Records
          </div>

          <div className="summary-value">
            {payrolls.length}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Gross Payroll
          </div>

          <div className="summary-value">
            {formatCurrency(summary.totalGross)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Total Deductions
          </div>

          <div className="summary-value">
            {formatCurrency(summary.totalDeductions)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Net Payroll
          </div>

          <div className="summary-value">
            {formatCurrency(summary.totalNet)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Paid
          </div>

          <div className="summary-value">
            {summary.paid}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Processed
          </div>

          <div className="summary-value">
            {summary.processed}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">
            Pending
          </div>

          <div className="summary-value">
            {summary.pending}
          </div>
        </div>

      </div>

      {/* Payroll Form - Admin + Accountant only */}

      {canManagePayroll && (
        <section className="editorial-section">

          <div className="section-heading">
            <h2>
              {editingId
                ? 'Edit Payroll Record'
                : 'Process Employee Payroll'}
            </h2>

            <p>
              Enter monthly salary details and payment
              information.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-field">
                <label htmlFor="payrollNumber">
                  Payroll Number *
                </label>

                <input
                  id="payrollNumber"
                  name="payrollNumber"
                  type="text"
                  value={form.payrollNumber}
                  onChange={handleChange}
                  placeholder="PAYROLL-2026-002"
                />
              </div>

              <div className="form-field">
                <label htmlFor="employeeId">
                  Employee *
                </label>

                <select
                  id="employeeId"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.employeeId} —{' '}
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="salaryMonth">
                  Salary Month *
                </label>

                <input
                  id="salaryMonth"
                  name="salaryMonth"
                  type="month"
                  value={getMonthValue(
                    form.salaryMonth
                  )}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (!value) {
                      setForm((previous) => ({
                        ...previous,
                        salaryMonth: ''
                      }));

                      return;
                    }

                    const [year, month] =
                      value.split('-');

                    const date = new Date(
                      Number(year),
                      Number(month) - 1,
                      1
                    );

                    const formatted =
                      date.toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          year: 'numeric'
                        }
                      );

                    setForm((previous) => ({
                      ...previous,
                      salaryMonth: formatted
                    }));
                  }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="basicSalary">
                  Basic Salary *
                </label>

                <input
                  id="basicSalary"
                  name="basicSalary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basicSalary}
                  onChange={handleChange}
                  placeholder="45000"
                />
              </div>

              <div className="form-field">
                <label htmlFor="bonus">
                  Bonus
                </label>

                <input
                  id="bonus"
                  name="bonus"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.bonus}
                  onChange={handleChange}
                  placeholder="3000"
                />
              </div>

              <div className="form-field">
                <label htmlFor="deductions">
                  Deductions
                </label>

                <input
                  id="deductions"
                  name="deductions"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deductions}
                  onChange={handleChange}
                  placeholder="2000"
                />
              </div>

              <div className="form-field">
                <label htmlFor="paymentDate">
                  Payment Date
                </label>

                <input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={form.paymentDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="paymentStatus">
                  Payment Status
                </label>

                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleChange}
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Processed">
                    Processed
                  </option>

                  <option value="Paid">
                    Paid
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="paymentMethod">
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={form.paymentMethod}
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

              <div className="form-field">
                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional payroll notes"
                />
              </div>

              <div className="payroll-calculation">

                <div>
                  <span>Basic Salary</span>

                  <strong>
                    {formatCurrency(basicSalary)}
                  </strong>
                </div>

                <div>
                  <span>Bonus</span>

                  <strong>
                    {formatCurrency(bonus)}
                  </strong>
                </div>

                <div>
                  <span>Deductions</span>

                  <strong>
                    -{formatCurrency(deductions)}
                  </strong>
                </div>

                <div className="net-total">
                  <span>Net Salary</span>

                  <strong>
                    {formatCurrency(
                      calculatedNetSalary
                    )}
                  </strong>
                </div>

              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : editingId
                    ? 'Update Payroll'
                    : 'Process Payroll'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>
      )}

      {/* Payroll Register */}

      <section className="editorial-section">

        <div className="section-heading">

          <h2>
            {canManagePayroll
              ? 'Payroll Register'
              : 'My Payroll'}
          </h2>

          <p>
            {canManagePayroll
              ? 'Review and manage employee salary records.'
              : 'Review your salary and payment records.'}
          </p>

        </div>

        {/* Search and filter */}

        <div className="table-toolbar">

          <div className="table-search">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                canManagePayroll
                  ? 'Search employee, payroll number or month...'
                  : 'Search payroll number or month...'
              }
            />

          </div>

          <div className="table-filter">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Processed">
                Processed
              </option>

              <option value="Paid">
                Paid
              </option>
            </select>

          </div>

        </div>

        {/* Loading */}

        {loading ? (

          <div className="empty-state">

            <i className="bi bi-hourglass-split"></i>

            <p>
              Loading payroll records...
            </p>

          </div>

        ) : filteredPayrolls.length === 0 ? (

          <div className="empty-state">

            <i className="bi bi-wallet2"></i>

            <p>
              No payroll records found.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table editorial-table">

              <thead>

                <tr>
                  <th>Payroll</th>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Basic</th>
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Payment Date</th>
                  <th>Status</th>

                  {canManagePayroll && (
                    <th>Actions</th>
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredPayrolls.map((payroll) => {

                  const employee =
                    payroll.employeeId || {};

                  return (

                    <tr key={payroll._id}>

                      <td>

                        <span className="payroll-number">
                          {payroll.payrollNumber}
                        </span>

                      </td>

                      <td>

                        <strong>
                          {employee.fullName ||
                            'Unknown Employee'}
                        </strong>

                        <small className="d-block text-muted">
                          {employee.employeeId || ''}
                        </small>

                      </td>

                      <td>
                        {payroll.salaryMonth}
                      </td>

                      <td>
                        {formatCurrency(
                          payroll.basicSalary
                        )}
                      </td>

                      <td className="amount-positive">
                        {formatCurrency(
                          payroll.bonus
                        )}
                      </td>

                      <td className="amount-negative">
                        {formatCurrency(
                          payroll.deductions
                        )}
                      </td>

                      <td>

                        <strong>
                          {formatCurrency(
                            payroll.netSalary
                          )}
                        </strong>

                      </td>

                      <td>
                        {formatDate(
                          payroll.paymentDate
                        )}
                      </td>

                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            payroll.paymentStatus
                          )}`}
                        >
                          {payroll.paymentStatus}
                        </span>

                      </td>

                      {canManagePayroll && (

                        <td>

                          <div className="table-actions">

                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              title="Edit payroll"
                              onClick={() =>
                                handleEdit(payroll)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              title="Delete payroll"
                              onClick={() =>
                                handleDelete(
                                  payroll._id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>

                        </td>

                      )}

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

