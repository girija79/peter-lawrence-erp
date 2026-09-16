const PettyCash = require('../models/PettyCash');

/*
  GET /api/petty-cash
  Get all petty cash transactions
*/
const getPettyCash = async (req, res) => {
  try {
    const transactions = await PettyCash.find()
      .populate('recordedBy', 'name email role')
      .sort({ transactionDate: -1, createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch petty cash records',
      error: error.message
    });
  }
};

/*
  GET /api/petty-cash/:id
  Get one transaction
*/
const getPettyCashById = async (req, res) => {
  try {
    const transaction = await PettyCash.findById(req.params.id)
      .populate('recordedBy', 'name email role');

    if (!transaction) {
      return res.status(404).json({
        message: 'Petty cash transaction not found'
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch petty cash transaction',
      error: error.message
    });
  }
};

/*
  POST /api/petty-cash
  Create transaction
*/
const createPettyCash = async (req, res) => {
  try {
    const {
      transactionNumber,
      transactionDate,
      transactionType,
      category,
      amount,
      description,
      partyName,
      paymentMethod,
      status,
      notes
    } = req.body;

    // Required fields
    if (
      !transactionNumber ||
      !transactionDate ||
      !transactionType ||
      amount === undefined ||
      amount === null ||
      !description ||
      !partyName
    ) {
      return res.status(400).json({
        message:
          'Transaction number, date, type, amount, description and party name are required'
      });
    }

    // Validate amount
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than 0'
      });
    }

    // Prevent duplicate transaction number
    const existingTransaction = await PettyCash.findOne({
      transactionNumber: transactionNumber.trim()
    });

    if (existingTransaction) {
      return res.status(400).json({
        message: 'Transaction number already exists'
      });
    }

    const transaction = await PettyCash.create({
      transactionNumber: transactionNumber.trim(),
      transactionDate,
      transactionType,
      category,
      amount: numericAmount,
      description: description.trim(),
      partyName: partyName.trim(),
      paymentMethod,
      status,
      recordedBy: req.user._id,
      notes: notes ? notes.trim() : ''
    });

    const populatedTransaction = await PettyCash.findById(
      transaction._id
    ).populate('recordedBy', 'name email role');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create petty cash transaction',
      error: error.message
    });
  }
};

/*
  PUT /api/petty-cash/:id
  Update transaction
*/
const updatePettyCash = async (req, res) => {
  try {
    const transaction = await PettyCash.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: 'Petty cash transaction not found'
      });
    }

    const {
      transactionNumber,
      transactionDate,
      transactionType,
      category,
      amount,
      description,
      partyName,
      paymentMethod,
      status,
      notes
    } = req.body;

    // Check duplicate transaction number
    if (transactionNumber) {
      const duplicate = await PettyCash.findOne({
        transactionNumber: transactionNumber.trim(),
        _id: { $ne: transaction._id }
      });

      if (duplicate) {
        return res.status(400).json({
          message: 'Transaction number already exists'
        });
      }

      transaction.transactionNumber = transactionNumber.trim();
    }

    if (transactionDate !== undefined) {
      transaction.transactionDate = transactionDate;
    }

    if (transactionType !== undefined) {
      transaction.transactionType = transactionType;
    }

    if (category !== undefined) {
      transaction.category = category;
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (Number.isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          message: 'Amount must be greater than 0'
        });
      }

      transaction.amount = numericAmount;
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          message: 'Description is required'
        });
      }

      transaction.description = description.trim();
    }

    if (partyName !== undefined) {
      if (!partyName.trim()) {
        return res.status(400).json({
          message: 'Party name is required'
        });
      }

      transaction.partyName = partyName.trim();
    }

    if (paymentMethod !== undefined) {
      transaction.paymentMethod = paymentMethod;
    }

    if (status !== undefined) {
      transaction.status = status;
    }

    if (notes !== undefined) {
      transaction.notes = notes.trim();
    }

    await transaction.save();

    const updatedTransaction = await PettyCash.findById(
      transaction._id
    ).populate('recordedBy', 'name email role');

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update petty cash transaction',
      error: error.message
    });
  }
};

/*
  DELETE /api/petty-cash/:id
  Delete transaction
*/
const deletePettyCash = async (req, res) => {
  try {
    const transaction = await PettyCash.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: 'Petty cash transaction not found'
      });
    }

    await PettyCash.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Petty cash transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete petty cash transaction',
      error: error.message
    });
  }
};

module.exports = {
  getPettyCash,
  getPettyCashById,
  createPettyCash,
  updatePettyCash,
  deletePettyCash
};