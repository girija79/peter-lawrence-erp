
import { useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const initialForm = {
  transactionNumber: '',
  transactionDate: '',
  transactionType: 'Cash Out',
  category: 'Office Supplies',
  amount: '',
  description: '',
  partyName: '',
  paymentMethod: 'Cash',
  status: 'Approved',
  notes: ''
};

const categories = [
  'Office Supplies',
  'Travel',
  'Utilities',
  'Meals & Refreshments',
  'Courier & Postage',
  'Maintenance',
  'Miscellaneous',
  'Other'
];

const statuses = [
  'Pending',
  'Approved',
  'Rejected'
];

function PettyCash() {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === 'admin';
  const isAccountant = user?.role === 'accountant';

  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/petty-cash');

      setTransactions(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load petty cash records.'
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

    if (!form.transactionNumber.trim()) {
      setError('Please enter a transaction number.');
      return;
    }

    if (!form.transactionDate) {
      setError('Please select a transaction date.');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    if (!form.description.trim()) {
      setError('Please enter a transaction description.');
      return;
    }

    if (!form.partyName.trim()) {
      setError('Please enter the party name.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        amount: Number(form.amount)
      };

      if (editingId) {
        await api.put(
          `/petty-cash/${editingId}`,
          payload
        );

        setSuccess(
          'Petty cash transaction updated successfully.'
        );
      } else {
        await api.post('/petty-cash', payload);

        setSuccess(
          'Petty cash transaction recorded successfully.'
        );
      }

      resetForm();
      await fetchTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to save petty cash transaction.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);

    setForm({
      transactionNumber:
        transaction.transactionNumber || '',

      transactionDate: transaction.transactionDate
        ? new Date(transaction.transactionDate)
            .toISOString()
            .split('T')[0]
        : '',

      transactionType:
        transaction.transactionType || 'Cash Out',

      category:
        transaction.category || 'Other',

      amount:
        transaction.amount ?? '',

      description:
        transaction.description || '',

      partyName:
        transaction.partyName || '',

      paymentMethod:
        transaction.paymentMethod || 'Cash',

      status:
        transaction.status || 'Approved',

      notes:
        transaction.notes || ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this petty cash transaction?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await api.delete(`/petty-cash/${id}`);

      setSuccess(
        'Petty cash transaction deleted successfully.'
      );

      if (editingId === id) {
        resetForm();
      }

      await fetchTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to delete transaction.'
      );
    }
  };

  const filteredTransactions = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !searchValue ||
        transaction.transactionNumber
          ?.toLowerCase()
          .includes(searchValue) ||
        transaction.description
          ?.toLowerCase()
          .includes(searchValue) ||
        transaction.partyName
          ?.toLowerCase()
          .includes(searchValue) ||
        transaction.category
          ?.toLowerCase()
          .includes(searchValue);

      const matchesType =
        typeFilter === 'All' ||
        transaction.transactionType === typeFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        transaction.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    transactions,
    search,
    typeFilter,
    statusFilter
  ]);

  const summary = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;
    let pending = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === 'Pending') {
        pending += 1;
      }

      if (transaction.status !== 'Approved') {
        return;
      }

      const amount = Number(transaction.amount) || 0;

      if (transaction.transactionType === 'Cash In') {
        cashIn += amount;
      }

      if (transaction.transactionType === 'Cash Out') {
        cashOut += amount;
      }
    });

    return {
      cashIn,
      cashOut,
      balance: cashIn - cashOut,
      pending
    };
  }, [transactions]);

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      'en-IN'
    )}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'status-approved';

      case 'Rejected':
        return 'status-rejected';

      default:
        return 'status-pending';
    }
  };

  const getTypeClass = (type) => {
    return type === 'Cash In'
      ? 'cash-in'
      : 'cash-out';
  };

  return (
    <div className="page-container petty-cash-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            FINANCE & ACCOUNTS
          </div>

          <h1>Petty Cash</h1>

          <p>
            Manage day-to-day cash transactions,
            expenses and petty cash balances.
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
      <div className="summary-grid petty-cash-summary-grid">

        <div className="summary-card">
          <div className="summary-card-label">
            Cash Balance
          </div>

          <div className="summary-card-value">
            {formatCurrency(summary.balance)}
          </div>

          <div className="summary-card-note">
            Approved cash position
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Total Cash In
          </div>

          <div className="summary-card-value">
            {formatCurrency(summary.cashIn)}
          </div>

          <div className="summary-card-note">
            Approved receipts
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">
            Total Cash Out
          </div>

          <div className="summary-card-value">
            {formatCurrency(summary.cashOut)}
          </div>

          <div className="summary-card-note">
            Approved expenses
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
            Awaiting approval
          </div>
        </div>

      </div>

      {/* TRANSACTION FORM */}
      {(isAdmin || isAccountant) && (
        <section className="editorial-section">

          <div className="section-heading">
            <div>
              <span className="section-kicker">
                {editingId
                  ? 'UPDATE TRANSACTION'
                  : 'NEW TRANSACTION'}
              </span>

              <h2>
                {editingId
                  ? 'Edit Petty Cash Transaction'
                  : 'Record Petty Cash Transaction'}
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
                  Transaction Number <span>*</span>
                </label>

                <input
                  type="text"
                  name="transactionNumber"
                  value={form.transactionNumber}
                  onChange={handleChange}
                  placeholder="PC-2026-001"
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Transaction Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="transactionDate"
                  value={form.transactionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Transaction Type <span>*</span>
                </label>

                <select
                  name="transactionType"
                  value={form.transactionType}
                  onChange={handleChange}
                >
                  <option value="Cash Out">
                    Cash Out
                  </option>

                  <option value="Cash In">
                    Cash In
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>
                  Amount <span>*</span>
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Paid To / Received From <span>*</span>
                </label>

                <input
                  type="text"
                  name="partyName"
                  value={form.partyName}
                  onChange={handleChange}
                  placeholder="Enter person or organization"
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
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
                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field form-field-full">
                <label>
                  Description <span>*</span>
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe the petty cash transaction..."
                  required
                />
              </div>

              <div className="form-field form-field-full">
                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Optional administrative notes..."
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
                      ? 'Update Transaction'
                      : 'Record Transaction'}
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
      )}

      {/* TRANSACTION REGISTER */}
      <section className="editorial-section">

        <div className="section-heading">
          <div>
            <span className="section-kicker">
              CASH REGISTER
            </span>

            <h2>
              Petty Cash Transactions
            </h2>
          </div>
        </div>

        <div className="table-toolbar">

          <div className="table-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search transaction, party, category or description..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="table-filter">

            <label>
              Type
            </label>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="All">
                All
              </option>

              <option value="Cash In">
                Cash In
              </option>

              <option value="Cash Out">
                Cash Out
              </option>
            </select>

          </div>

          <div className="table-filter">

            <label>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>

          </div>

        </div>

        {loading ? (
          <div className="empty-state">

            <div className="spinner-border"></div>

            <h3>
              Loading transactions
            </h3>

            <p>
              Please wait while the petty cash register is loaded.
            </p>

          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">

            <i className="bi bi-wallet2"></i>

            <h3>
              No transactions found
            </h3>

            <p>
              No petty cash transactions match the current filters.
            </p>

          </div>
        ) : (
          <div className="table-responsive">

            <table className="table editorial-table">

              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Party</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Recorded By</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredTransactions.map(
                  (transaction) => (
                    <tr key={transaction._id}>

                      <td>
                        <div className="table-primary-text">
                          {transaction.transactionNumber}
                        </div>

                        <div className="table-secondary-text">
                          {transaction.description}
                        </div>
                      </td>

                      <td>
                        {formatDate(
                          transaction.transactionDate
                        )}
                      </td>

                      <td>
                        <span
                          className={`transaction-type ${getTypeClass(
                            transaction.transactionType
                          )}`}
                        >
                          {transaction.transactionType ===
                          'Cash In' ? (
                            <i className="bi bi-arrow-down-left"></i>
                          ) : (
                            <i className="bi bi-arrow-up-right"></i>
                          )}

                          {transaction.transactionType}
                        </span>
                      </td>

                      <td>
                        {transaction.category}
                      </td>

                      <td>
                        {transaction.partyName}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            transaction.amount
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>

                      <td>
                        {transaction.recordedBy?.name ||
                          'Admin'}
                      </td>

                      <td>

                        <div className="table-actions">

                          {(isAdmin || isAccountant) && (
                            <button
                              type="button"
                              className="btn-table-action"
                              title="Edit transaction"
                              onClick={() =>
                                handleEdit(transaction)
                              }
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              className="btn-table-action btn-table-danger"
                              title="Delete transaction"
                              onClick={() =>
                                handleDelete(
                                  transaction._id
                                )
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default PettyCash;
