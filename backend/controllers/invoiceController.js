const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Case = require('../models/Case');

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('clientId', 'fullName email')
      .populate('caseId', 'caseNumber title')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Get single invoice
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'fullName email')
      .populate('caseId', 'caseNumber title');

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

// Create invoice
const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      clientId,
      caseId,
      invoiceDate,
      dueDate,
      description,
      amount,
      tax,
      status,
      notes
    } = req.body;

    if (
      !invoiceNumber ||
      !clientId ||
      !invoiceDate ||
      !dueDate ||
      amount === undefined
    ) {
      return res.status(400).json({
        message: 'Invoice number, client, invoice date, due date and amount are required'
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(400).json({
        message: 'Client not found'
      });
    }

    if (caseId) {
      const legalCase = await Case.findById(caseId);

      if (!legalCase) {
        return res.status(400).json({
          message: 'Case not found'
        });
      }
    }

    const numericAmount = Number(amount);
    const numericTax = Number(tax || 0);

    if (
      Number.isNaN(numericAmount) ||
      Number.isNaN(numericTax) ||
      numericAmount < 0 ||
      numericTax < 0
    ) {
      return res.status(400).json({
        message: 'Amount and tax must be valid non-negative numbers'
      });
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      clientId,
      caseId: caseId || null,
      invoiceDate,
      dueDate,
      description: description || '',
      amount: numericAmount,
      tax: numericTax,
      totalAmount: numericAmount + numericTax,
      status: status || 'Draft',
      notes: notes || ''
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('clientId', 'fullName email')
      .populate('caseId', 'caseNumber title');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Invoice number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    const {
      invoiceNumber,
      clientId,
      caseId,
      invoiceDate,
      dueDate,
      description,
      amount,
      tax,
      status,
      notes
    } = req.body;

    if (clientId) {
      const client = await Client.findById(clientId);

      if (!client) {
        return res.status(400).json({
          message: 'Client not found'
        });
      }

      invoice.clientId = clientId;
    }

    if (caseId !== undefined) {
      if (caseId) {
        const legalCase = await Case.findById(caseId);

        if (!legalCase) {
          return res.status(400).json({
            message: 'Case not found'
          });
        }
      }

      invoice.caseId = caseId || null;
    }

    if (invoiceNumber !== undefined) {
      invoice.invoiceNumber = invoiceNumber;
    }

    if (invoiceDate !== undefined) {
      invoice.invoiceDate = invoiceDate;
    }

    if (dueDate !== undefined) {
      invoice.dueDate = dueDate;
    }

    if (description !== undefined) {
      invoice.description = description;
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (Number.isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          message: 'Amount must be a valid non-negative number'
        });
      }

      invoice.amount = numericAmount;
    }

    if (tax !== undefined) {
      const numericTax = Number(tax);

      if (Number.isNaN(numericTax) || numericTax < 0) {
        return res.status(400).json({
          message: 'Tax must be a valid non-negative number'
        });
      }

      invoice.tax = numericTax;
    }

    invoice.totalAmount = invoice.amount + invoice.tax;

    if (status !== undefined) {
      invoice.status = status;
    }

    if (notes !== undefined) {
      invoice.notes = notes;
    }

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('clientId', 'fullName email')
      .populate('caseId', 'caseNumber title');

    res.json(updatedInvoice);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Invoice number already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    await invoice.deleteOne();

    res.json({
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};