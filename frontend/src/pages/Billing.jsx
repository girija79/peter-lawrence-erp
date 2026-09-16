import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientId: '',
    caseId: '',
    invoiceDate: '',
    dueDate: '',
    description: '',
    amount: '',
    tax: '',
    status: 'Draft',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [invoiceRes, clientRes, caseRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/clients'),
        api.get('/cases')
      ]);

      setInvoices(invoiceRes.data);
      setClients(clientRes.data);
      setCases(caseRes.data);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      clientId: '',
      caseId: '',
      invoiceDate: '',
      dueDate: '',
      description: '',
      amount: '',
      tax: '',
      status: 'Draft',
      notes: ''
    });

    setEditingInvoice(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingInvoice) {
        await api.put(`/invoices/${editingInvoice._id}`, formData);
      } else {
        await api.post('/invoices', formData);
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Failed to save invoice:', error);

      alert(
        error.response?.data?.message ||
        'Failed to save invoice'
      );
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);

    setFormData({
      invoiceNumber: invoice.invoiceNumber || '',
      clientId: invoice.clientId?._id || '',
      caseId: invoice.caseId?._id || '',
      invoiceDate: invoice.invoiceDate
        ? invoice.invoiceDate.substring(0, 10)
        : '',
      dueDate: invoice.dueDate
        ? invoice.dueDate.substring(0, 10)
        : '',
      description: invoice.description || '',
      amount: invoice.amount || '',
      tax: invoice.tax || '',
      status: invoice.status || 'Draft',
      notes: invoice.notes || ''
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this invoice?'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/invoices/${id}`);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete invoice:', error);

      alert(
        error.response?.data?.message ||
        'Failed to delete invoice'
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.totalAmount || 0),
    0
  );

  const issuedInvoices = invoices.filter(
    (invoice) =>
      invoice.status === 'Issued' ||
      invoice.status === 'Partially Paid'
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === 'Paid'
  );

  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === 'Overdue'
  );

  const issuedAmount = issuedInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.totalAmount || 0),
    0
  );

  const paidAmount = paidInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.totalAmount || 0),
    0
  );

  const overdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.totalAmount || 0),
    0
  );

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <div className="eyebrow">FINANCE & CLIENT ACCOUNTS</div>

          <h1>Billing</h1>

          <p className="page-description">
            Manage client invoices, billing records, outstanding amounts,
            and payment status across legal matters.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingInvoice(null);
            setShowForm(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Invoice
        </button>
      </div>

      <div className="summary-grid">

        <div className="summary-card">
          <div className="summary-label">Total Invoiced</div>
          <div className="summary-value">
            ₹{formatAmount(totalInvoiced)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Issued</div>
          <div className="summary-value">
            ₹{formatAmount(issuedAmount)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Paid</div>
          <div className="summary-value">
            ₹{formatAmount(paidAmount)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Overdue</div>
          <div className="summary-value">
            ₹{formatAmount(overdueAmount)}
          </div>
        </div>

      </div>

      {showForm && (
        <div className="card lawyer-form-card">

          <div className="card-header">
            <h2>
              {editingInvoice
                ? 'Edit Invoice'
                : 'Create Invoice'}
            </h2>

            <p>
              Enter the invoice details and client billing information.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div>
                <label className="form-label">
                  Invoice Number
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="INV-2026-002"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Client
                </label>

                <select
                  className="form-select"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Client</option>

                  {clients.map((client) => (
                    <option
                      key={client._id}
                      value={client._id}
                    >
                      {client.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Case
                </label>

                <select
                  className="form-select"
                  name="caseId"
                  value={formData.caseId}
                  onChange={handleChange}
                >
                  <option value="">No Case / Optional</option>

                  {cases.map((legalCase) => (
                    <option
                      key={legalCase._id}
                      value={legalCase._id}
                    >
                      {legalCase.caseNumber} — {legalCase.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Status
                </label>

                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Issued">Issued</option>
                  <option value="Partially Paid">
                    Partially Paid
                  </option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Invoice Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Due Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
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
                  step="0.01"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Tax
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="9000"
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Description
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Legal consultation and case handling charges"
                />
              </div>

              <div className="form-grid-full">
                <label className="form-label">
                  Notes
                </label>

                <textarea
                  className="form-control"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional billing notes"
                ></textarea>
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                <i className="bi bi-check2 me-2"></i>

                {editingInvoice
                  ? 'Update Invoice'
                  : 'Create Invoice'}
              </button>

            </div>

          </form>
        </div>
      )}

      <div className="card">

        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h2>Invoice Register</h2>

            <p>
              {invoices.length} invoice
              {invoices.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="bi bi-hourglass-split"></i>
            <h3>Loading invoices</h3>
            <p>Please wait while billing records are retrieved.</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-receipt"></i>
            <h3>No invoices found</h3>
            <p>
              Create the first client invoice to begin tracking billing.
            </p>
          </div>
        ) : (
          <div className="table-responsive">

            <table className="table">

              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Case</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {invoices.map((invoice) => {

                  let statusClass = 'status-neutral';

                  if (invoice.status === 'Paid') {
                    statusClass = 'status-active';
                  } else if (
                    invoice.status === 'Overdue'
                  ) {
                    statusClass = 'status-inactive';
                  } else if (
                    invoice.status === 'Issued' ||
                    invoice.status === 'Partially Paid'
                  ) {
                    statusClass = 'status-warning';
                  }

                  return (
                    <tr key={invoice._id}>

                      <td>
                        <div className="table-primary-text">
                          {invoice.invoiceNumber}
                        </div>

                        <div className="table-secondary-text">
                          {invoice.description || 'No description'}
                        </div>
                      </td>

                      <td>
                        <div className="table-primary-text">
                          {invoice.clientId?.fullName || '-'}
                        </div>

                        <div className="table-secondary-text">
                          {invoice.clientId?.email || ''}
                        </div>
                      </td>

                      <td>
                        {invoice.caseId ? (
                          <>
                            <div className="table-primary-text">
                              {invoice.caseId.caseNumber}
                            </div>

                            <div className="table-secondary-text">
                              {invoice.caseId.title}
                            </div>
                          </>
                        ) : (
                          <span className="table-secondary-text">
                            No case
                          </span>
                        )}
                      </td>

                      <td>
                        {formatDate(invoice.invoiceDate)}
                      </td>

                      <td>
                        {formatDate(invoice.dueDate)}
                      </td>

                      <td>
                        <div className="table-primary-text">
                          ₹{formatAmount(invoice.totalAmount)}
                        </div>
                      </td>

                      <td>
                        <span className={`status-badge ${statusClass}`}>
                          {invoice.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">

                          <button
                            className="btn btn-outline-secondary"
                            title="Edit invoice"
                            onClick={() => handleEdit(invoice)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            className="btn btn-outline-danger"
                            title="Delete invoice"
                            onClick={() => handleDelete(invoice._id)}
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

      </div>

    </div>
  );
};

export default Billing;