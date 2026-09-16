const ClientPayment = require('../models/ClientPayment');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// Recalculate invoice payment status
const recalculateInvoiceStatus = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    return null;
  }

  // Only COMPLETED payments count toward the invoice balance.
  const completedPayments = await ClientPayment.find({
    invoiceId: invoice._id,
    status: 'Completed'
  });

  const totalPaid = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  if (totalPaid >= Number(invoice.totalAmount)) {
    invoice.status = 'Paid';
  } else if (totalPaid > 0) {
    invoice.status = 'Partially Paid';
  } else {
    invoice.status = 'Issued';
  }

  await invoice.save();

  return invoice;
};


// Get all client payments
const getClientPayments = async (req, res) => {
  try {
    const payments = await ClientPayment.find()
      .populate('invoiceId', 'invoiceNumber totalAmount status')
      .populate('clientId', 'fullName email')
      .sort({ paymentDate: -1, createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch client payments',
      error: error.message
    });
  }
};


// Get single client payment
const getClientPaymentById = async (req, res) => {
  try {
    const payment = await ClientPayment.findById(req.params.id)
      .populate('invoiceId', 'invoiceNumber totalAmount status')
      .populate('clientId', 'fullName email');

    if (!payment) {
      return res.status(404).json({
        message: 'Client payment not found'
      });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch client payment',
      error: error.message
    });
  }
};


// Create client payment
const createClientPayment = async (req, res) => {
  try {
    const {
      paymentNumber,
      invoiceId,
      clientId,
      paymentDate,
      amount,
      paymentMethod,
      transactionReference,
      status,
      notes
    } = req.body;

    if (
      !paymentNumber ||
      !invoiceId ||
      !clientId ||
      !paymentDate ||
      amount === undefined
    ) {
      return res.status(400).json({
        message:
          'Payment number, invoice, client, payment date and amount are required'
      });
    }

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(400).json({
        message: 'Invoice not found'
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(400).json({
        message: 'Client not found'
      });
    }

    if (invoice.clientId.toString() !== clientId.toString()) {
      return res.status(400).json({
        message: 'Selected client does not belong to the selected invoice'
      });
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: 'Payment amount must be greater than zero'
      });
    }

    const paymentStatus = status || 'Completed';

    // Only completed payments consume invoice balance.
    if (paymentStatus === 'Completed') {
      const completedPayments = await ClientPayment.find({
        invoiceId,
        status: 'Completed'
      });

      const totalAlreadyPaid = completedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      const remainingAmount =
        Number(invoice.totalAmount) - totalAlreadyPaid;

      if (numericAmount > remainingAmount) {
        return res.status(400).json({
          message:
            `Payment exceeds the remaining invoice balance of ${remainingAmount}`
        });
      }
    }

    const payment = await ClientPayment.create({
      paymentNumber,
      invoiceId,
      clientId,
      paymentDate,
      amount: numericAmount,
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionReference: transactionReference || '',
      status: paymentStatus,
      notes: notes || ''
    });

    await recalculateInvoiceStatus(invoiceId);

    const populatedPayment = await ClientPayment.findById(payment._id)
      .populate('invoiceId', 'invoiceNumber totalAmount status')
      .populate('clientId', 'fullName email');

    res.status(201).json(populatedPayment);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Payment number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create client payment',
      error: error.message
    });
  }
};


// Update client payment
const updateClientPayment = async (req, res) => {
  try {
    const payment = await ClientPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: 'Client payment not found'
      });
    }

    const {
      paymentNumber,
      paymentDate,
      amount,
      paymentMethod,
      transactionReference,
      status,
      notes
    } = req.body;

    const newAmount =
      amount !== undefined ? Number(amount) : Number(payment.amount);

    const newStatus =
      status !== undefined ? status : payment.status;

    if (Number.isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({
        message: 'Payment amount must be greater than zero'
      });
    }

    // If payment becomes Completed, make sure it does not exceed
    // the invoice's remaining balance.
    if (newStatus === 'Completed') {
      const invoice = await Invoice.findById(payment.invoiceId);

      if (!invoice) {
        return res.status(400).json({
          message: 'Invoice not found'
        });
      }

      const otherCompletedPayments = await ClientPayment.find({
        invoiceId: payment.invoiceId,
        status: 'Completed',
        _id: { $ne: payment._id }
      });

      const totalOtherCompleted = otherCompletedPayments.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

      const remainingAmount =
        Number(invoice.totalAmount) - totalOtherCompleted;

      if (newAmount > remainingAmount) {
        return res.status(400).json({
          message:
            `Payment exceeds the remaining invoice balance of ${remainingAmount}`
        });
      }
    }

    if (paymentNumber !== undefined) {
      payment.paymentNumber = paymentNumber;
    }

    if (paymentDate !== undefined) {
      payment.paymentDate = paymentDate;
    }

    if (amount !== undefined) {
      payment.amount = newAmount;
    }

    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    if (transactionReference !== undefined) {
      payment.transactionReference = transactionReference;
    }

    if (status !== undefined) {
      payment.status = status;
    }

    if (notes !== undefined) {
      payment.notes = notes;
    }

    await payment.save();

    await recalculateInvoiceStatus(payment.invoiceId);

    const updatedPayment = await ClientPayment.findById(payment._id)
      .populate(
        'invoiceId',
        'invoiceNumber totalAmount status'
      )
      .populate(
        'clientId',
        'fullName email'
      );

    res.json(updatedPayment);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Payment number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to update client payment',
      error: error.message
    });
  }
};


// Delete client payment
const deleteClientPayment = async (req, res) => {
  try {
    const payment = await ClientPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: 'Client payment not found'
      });
    }

    const invoiceId = payment.invoiceId;

    await payment.deleteOne();

    await recalculateInvoiceStatus(invoiceId);

    res.json({
      message: 'Client payment deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete client payment',
      error: error.message
    });
  }
};


module.exports = {
  getClientPayments,
  getClientPaymentById,
  createClientPayment,
  updateClientPayment,
  deleteClientPayment
};