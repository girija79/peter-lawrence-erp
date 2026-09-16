import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

function Receipt() {
  const { id } = useParams();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        const response = await api.get(`/receipts/${id}`);
        setReceipt(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load payment receipt.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [id]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  };

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="receipt-page">
        <div className="receipt-loading">
          <div className="spinner-border"></div>
          <p>Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-page">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="receipt-page">

      {/* Toolbar */}
      <div className="receipt-toolbar no-print">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => window.close()}
        >
          <i className="bi bi-x-lg me-2"></i>
          Close
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer me-2"></i>
          Print Receipt
        </button>
      </div>

      {/* Receipt document */}
      <div className="receipt-document">

        {/* Header */}
        <header className="receipt-header">

          <div>
            <div className="receipt-firm-name">
              {receipt.firm.name}
            </div>

            <div className="receipt-firm-location">
              {receipt.firm.location}
            </div>
          </div>

          <div className="receipt-title-block">
            <div className="receipt-label">
              PAYMENT RECEIPT
            </div>

            <div className="receipt-number">
              {receipt.receipt.receiptNumber}
            </div>
          </div>

        </header>

        <div className="receipt-rule"></div>

        {/* Payment information */}
        <section className="receipt-meta-grid">

          <div>
            <span className="receipt-meta-label">
              Receipt Date
            </span>

            <strong>
              {formatDate(receipt.receipt.receiptDate)}
            </strong>
          </div>

          <div>
            <span className="receipt-meta-label">
              Payment Method
            </span>

            <strong>
              {receipt.receipt.paymentMethod}
            </strong>
          </div>

          <div>
            <span className="receipt-meta-label">
              Transaction Reference
            </span>

            <strong>
              {receipt.receipt.transactionReference || '-'}
            </strong>
          </div>

        </section>

        {/* Client */}
        <section className="receipt-section">

          <div className="receipt-section-title">
            Received From
          </div>

          <div className="receipt-client">

            <h2>
              {receipt.client.name}
            </h2>

            <div className="receipt-contact-grid">

              <div>
                <span>Email</span>
                <strong>
                  {receipt.client.email || '-'}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {receipt.client.phone || '-'}
                </strong>
              </div>

              <div>
                <span>Address</span>
                <strong>
                  {receipt.client.address || '-'}
                </strong>
              </div>

            </div>

          </div>

        </section>

        {/* Invoice */}
        <section className="receipt-section">

          <div className="receipt-section-title">
            Invoice Details
          </div>

          <div className="receipt-invoice-grid">

            <div>
              <span>Invoice Number</span>
              <strong>
                {receipt.invoice.invoiceNumber}
              </strong>
            </div>

            <div>
              <span>Invoice Date</span>
              <strong>
                {formatDate(receipt.invoice.invoiceDate)}
              </strong>
            </div>

            <div>
              <span>Due Date</span>
              <strong>
                {formatDate(receipt.invoice.dueDate)}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong>
                {receipt.invoice.status}
              </strong>
            </div>

          </div>

        </section>

        {/* Amount received */}
        <section className="receipt-amount-box">

          <div>
            <span>
              Amount Received
            </span>

            <strong>
              ₹{formatCurrency(
                receipt.receipt.amountReceived
              )}
            </strong>
          </div>

          <div className="receipt-amount-note">
            Payment recorded against invoice{' '}
            <strong>
              {receipt.invoice.invoiceNumber}
            </strong>
          </div>

        </section>

        {/* Account summary */}
        <section className="receipt-account">

          <div className="receipt-section-title">
            Account Summary
          </div>

          <div className="receipt-account-row">
            <span>
              Invoice Total
            </span>

            <strong>
              ₹{formatCurrency(
                receipt.accountSummary.invoiceTotal
              )}
            </strong>
          </div>

          <div className="receipt-account-row">
            <span>
              Total Paid
            </span>

            <strong>
              ₹{formatCurrency(
                receipt.accountSummary.totalPaid
              )}
            </strong>
          </div>

          <div className="receipt-account-row receipt-outstanding">
            <span>
              Outstanding Balance
            </span>

            <strong>
              ₹{formatCurrency(
                receipt.accountSummary.outstandingBalance
              )}
            </strong>
          </div>

        </section>

        {/* Footer */}
        <footer className="receipt-footer">

          <div>
            <strong>
              Payment Status
            </strong>

            <span className="receipt-status">
              {receipt.receipt.status}
            </span>
          </div>

          <p>
            This receipt confirms that the above payment has
            been received and recorded by {receipt.firm.name}.
          </p>

          <div className="receipt-signature-area">
            <div>
              Authorized by
            </div>

            <div className="receipt-signature-line"></div>

            <div className="receipt-signature-name">
              Peter Law Firm
            </div>
          </div>

        </footer>

      </div>
    </div>
  );
}

export default Receipt;