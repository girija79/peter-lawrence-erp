import { useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const initialForm = {
  paymentNumber: "",
  invoiceId: "",
  clientId: "",
  paymentDate: "",
  amount: "",
  paymentMethod: "Bank Transfer",
  transactionReference: "",
  status: "Completed",
  notes: "",
};

function ClientPayments() {
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === "admin";
  const isAccountant = user?.role === "accountant";
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [paymentsRes, invoicesRes, clientsRes] = await Promise.all([
        api.get("/client-payments"),
        api.get("/invoices"),
        api.get("/clients"),
      ]);

      setPayments(paymentsRes.data);
      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load client payment data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedInvoice = useMemo(() => {
    return invoices.find((invoice) => invoice._id === form.invoiceId);
  }, [invoices, form.invoiceId]);

  const totalReceived = useMemo(() => {
    return payments
      .filter((payment) => payment.status === "Completed")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [payments]);

  const pendingAmount = useMemo(() => {
    return payments
      .filter((payment) => payment.status === "Pending")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [payments]);

  const outstandingAmount = useMemo(() => {
    return invoices.reduce((sum, invoice) => {
      const invoicePayments = payments
        .filter(
          (payment) =>
            payment.invoiceId?._id === invoice._id &&
            payment.status === "Completed",
        )
        .reduce(
          (paymentSum, payment) => paymentSum + Number(payment.amount || 0),
          0,
        );

      const outstanding = Number(invoice.totalAmount || 0) - invoicePayments;

      return sum + Math.max(outstanding, 0);
    }, 0);
  }, [invoices, payments]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "invoiceId" && !editingId) {
      const invoice = invoices.find((item) => item._id === value);

      if (invoice?.clientId?._id) {
        setForm((previous) => ({
          ...previous,
          invoiceId: value,
          clientId: invoice.clientId._id,
        }));
      }
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.paymentNumber.trim()) {
        setError("Payment number is required.");
        return;
      }

      if (!form.invoiceId) {
        setError("Please select an invoice.");
        return;
      }

      if (!form.clientId) {
        setError("Please select a client.");
        return;
      }

      if (!form.paymentDate) {
        setError("Payment date is required.");
        return;
      }

      if (!form.amount || Number(form.amount) <= 0) {
        setError("Payment amount must be greater than zero.");
        return;
      }

      const payload = {
        paymentNumber: form.paymentNumber.trim(),
        invoiceId: form.invoiceId,
        clientId: form.clientId,
        paymentDate: form.paymentDate,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference.trim(),
        status: form.status,
        notes: form.notes.trim(),
      };

      if (editingId) {
        await api.put(`/client-payments/${editingId}`, payload);

        setSuccess("Client payment updated successfully.");
      } else {
        await api.post("/client-payments", payload);

        setSuccess("Client payment recorded successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save client payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingId(payment._id);

    setForm({
      paymentNumber: payment.paymentNumber || "",
      invoiceId: payment.invoiceId?._id || "",
      clientId: payment.clientId?._id || "",
      paymentDate: payment.paymentDate
        ? new Date(payment.paymentDate).toISOString().split("T")[0]
        : "",
      amount: payment.amount || "",
      paymentMethod: payment.paymentMethod || "Bank Transfer",
      transactionReference: payment.transactionReference || "",
      status: payment.status || "Completed",
      notes: payment.notes || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment? The related invoice balance will be recalculated.",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/client-payments/${paymentId}`);

      setSuccess("Client payment deleted successfully.");

      if (editingId === paymentId) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete client payment.",
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-active";

      case "Pending":
        return "status-warning";

      case "Failed":
      case "Refunded":
        return "status-inactive";

      default:
        return "status-neutral";
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Finance / Client Accounts</p>

          <h1>Client Payments</h1>

          <p className="page-description">
            Record, monitor and reconcile payments received against client
            invoices and legal matters.
          </p>
        </div>
      </div>

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

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Received</div>

          <div className="summary-value">₹{formatCurrency(totalReceived)}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Pending Payments</div>

          <div className="summary-value">₹{formatCurrency(pendingAmount)}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Outstanding</div>

          <div className="summary-value">
            ₹{formatCurrency(outstandingAmount)}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Payment Records</div>

          <div className="summary-value">{payments.length}</div>
        </div>
      </div>

      {(isAdmin || isAccountant) && (
        <div className="card lawyer-form-card">
          <div className="card-header">
            <div>
              <h2>
                {editingId ? "Edit Client Payment" : "Record Client Payment"}
              </h2>

              <p>
                {editingId
                  ? "Update the selected payment transaction."
                  : "Record a payment received against an issued client invoice."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div>
                <label className="form-label">Payment Number</label>

                <input
                  type="text"
                  name="paymentNumber"
                  className="form-control"
                  placeholder="PAY-2026-002"
                  value={form.paymentNumber}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Payment Date</label>

                <input
                  type="date"
                  name="paymentDate"
                  className="form-control"
                  value={form.paymentDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Invoice</label>

                <select
                  name="invoiceId"
                  className="form-select"
                  value={form.invoiceId}
                  onChange={handleChange}
                >
                  <option value="">Select invoice</option>

                  {invoices.map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} — ₹
                      {formatCurrency(invoice.totalAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Client</label>

                <select
                  name="clientId"
                  className="form-select"
                  value={form.clientId}
                  onChange={handleChange}
                >
                  <option value="">Select client</option>

                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Amount</label>

                <div className="input-group">
                  <span className="input-group-text">₹</span>

                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    min="0"
                    step="0.01"
                    placeholder="20000"
                    value={form.amount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Payment Method</label>

                <select
                  name="paymentMethod"
                  className="form-select"
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Bank Transfer">Bank Transfer</option>

                  <option value="Cash">Cash</option>

                  <option value="Card">Card</option>

                  <option value="Online Payment">Online Payment</option>

                  <option value="Cheque">Cheque</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">Transaction Reference</label>

                <input
                  type="text"
                  name="transactionReference"
                  className="form-control"
                  placeholder="Bank / transaction reference"
                  value={form.transactionReference}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="form-label">Status</label>

                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Completed">Completed</option>

                  <option value="Pending">Pending</option>

                  <option value="Failed">Failed</option>

                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="form-grid-full">
                <label className="form-label">Notes</label>

                <textarea
                  name="notes"
                  className="form-control"
                  rows="3"
                  placeholder="Payment notes or reconciliation remarks"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {selectedInvoice && (
              <div className="mt-4 p-3 border">
                <div className="row">
                  <div className="col-md-4">
                    <small className="text-muted d-block">Invoice</small>

                    <strong>{selectedInvoice.invoiceNumber}</strong>
                  </div>

                  <div className="col-md-4">
                    <small className="text-muted d-block">Invoice Total</small>

                    <strong>
                      ₹{formatCurrency(selectedInvoice.totalAmount)}
                    </strong>
                  </div>

                  <div className="col-md-4">
                    <small className="text-muted d-block">Invoice Status</small>

                    <span
                      className={`status-badge ${getStatusClass(
                        selectedInvoice.status,
                      )}`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                    <i className="bi bi-check2 me-2"></i>

                    {editingId ? "Update Payment" : "Record Payment"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <h2>Payment Register</h2>

            <p>
              {payments.length} payment
              {payments.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner-border" role="status"></div>

            <p className="mt-3">Loading payment records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-cash-stack"></i>

            <h3>No payment records</h3>

            <p>Client payments recorded against invoices will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Client</th>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div className="table-primary-text">
                        {payment.paymentNumber}
                      </div>

                      {payment.transactionReference && (
                        <div className="table-secondary-text">
                          Ref: {payment.transactionReference}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {payment.clientId?.fullName || "-"}
                      </div>

                      <div className="table-secondary-text">
                        {payment.clientId?.email || ""}
                      </div>
                    </td>

                    <td>
                      <div className="table-primary-text">
                        {payment.invoiceId?.invoiceNumber || "-"}
                      </div>

                      <div className="table-secondary-text">
                        Invoice ₹
                        {formatCurrency(payment.invoiceId?.totalAmount)}
                      </div>
                    </td>

                    <td>{formatDate(payment.paymentDate)}</td>

                    <td>{payment.paymentMethod}</td>

                    <td>
                      <strong>₹{formatCurrency(payment.amount)}</strong>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          payment.status,
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        {payment.status === "Completed" && (
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            title="View receipt"
                            onClick={() =>
                              window.open(`/receipts/${payment._id}`, "_blank")
                            }
                          >
                            <i className="bi bi-receipt"></i>
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          title="Edit payment"
                          onClick={() => handleEdit(payment)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete payment"
                            onClick={() => handleDelete(payment._id)}
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

export default ClientPayments;
