const ClientPayment = require('../models/ClientPayment');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await ClientPayment.findById(req.params.id)
      .populate('invoiceId')
      .populate('clientId');

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'Completed') {
      return res.status(400).json({
        message: 'Receipt can only be generated for completed payments'
      });
    }

    const invoice = await Invoice.findById(payment.invoiceId._id);

    if (!invoice) {
      return res.status(404).json({
        message: 'Related invoice not found'
      });
    }

    const completedPayments = await ClientPayment.find({
      invoiceId: invoice._id,
      status: 'Completed'
    });

    const totalPaid = completedPayments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const outstandingBalance = Math.max(
      Number(invoice.totalAmount) - totalPaid,
      0
    );

    res.json({
      receipt: {
        receiptNumber: payment.paymentNumber,
        receiptDate: payment.paymentDate,
        amountReceived: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionReference: payment.transactionReference,
        status: payment.status
      },

      firm: {
        name: 'Peter Law Firm',
        location: 'Belgrade, Serbia'
      },

      client: {
        id: payment.clientId._id,
        name: payment.clientId.fullName,
        email: payment.clientId.email,
        phone: payment.clientId.phone || '',
        address: payment.clientId.address || ''
      },

      invoice: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        status: invoice.status
      },

      accountSummary: {
        invoiceTotal: Number(invoice.totalAmount),
        totalPaid,
        outstandingBalance
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to generate payment receipt',
      error: error.message
    });
  }
};

module.exports = {
  getPaymentReceipt
};