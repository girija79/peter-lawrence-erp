const Case = require('../models/Case');
const Client = require('../models/Client');
const Lawyer = require('../models/Lawyer');

// GET ALL CASES
const getCases = async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization')
      .sort({ createdAt: -1 });

    res.status(200).json(cases);
  } catch (error) {
    console.error('Get Cases Error:', error);
    res.status(500).json({
      message: 'Failed to fetch cases',
      error: error.message
    });
  }
};

// GET SINGLE CASE
const getCaseById = async (req, res) => {
  try {
    const legalCase = await Case.findById(req.params.id)
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization');

    if (!legalCase) {
      return res.status(404).json({
        message: 'Case not found'
      });
    }

    res.status(200).json(legalCase);
  } catch (error) {
    console.error('Get Case Error:', error);
    res.status(500).json({
      message: 'Failed to fetch case',
      error: error.message
    });
  }
};

// CREATE CASE
const createCase = async (req, res) => {
  try {
    const {
      caseNumber,
      title,
      clientId,
      lawyerId,
      category,
      description,
      court,
      status,
      filingDate,
      nextHearingDate,
      notes
    } = req.body;

    if (!caseNumber || !title || !clientId || !lawyerId) {
      return res.status(400).json({
        message: 'Case number, title, client and lawyer are required'
      });
    }

    // Check client
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        message: 'Selected client not found'
      });
    }

    // Check lawyer
    const lawyer = await Lawyer.findById(lawyerId);

    if (!lawyer) {
      return res.status(404).json({
        message: 'Selected lawyer not found'
      });
    }

    // Prevent duplicate case number
    const existingCase = await Case.findOne({ caseNumber });

    if (existingCase) {
      return res.status(400).json({
        message: 'Case number already exists'
      });
    }

    const legalCase = await Case.create({
      caseNumber,
      title,
      clientId,
      lawyerId,
      category: category || 'Other',
      description: description || '',
      court: court || '',
      status: status || 'New',
      filingDate,
      nextHearingDate,
      notes: notes || ''
    });

    const populatedCase = await Case.findById(legalCase._id)
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization');

    res.status(201).json(populatedCase);
  } catch (error) {
    console.error('Create Case Error:', error);
    res.status(500).json({
      message: 'Failed to create case',
      error: error.message
    });
  }
};

// UPDATE CASE
const updateCase = async (req, res) => {
  try {
    const legalCase = await Case.findById(req.params.id);

    if (!legalCase) {
      return res.status(404).json({
        message: 'Case not found'
      });
    }

    const {
      caseNumber,
      title,
      clientId,
      lawyerId,
      category,
      description,
      court,
      status,
      filingDate,
      nextHearingDate,
      notes
    } = req.body;

    // Check new client if provided
    if (clientId !== undefined) {
      const client = await Client.findById(clientId);

      if (!client) {
        return res.status(404).json({
          message: 'Selected client not found'
        });
      }

      legalCase.clientId = clientId;
    }

    // Check new lawyer if provided
    if (lawyerId !== undefined) {
      const lawyer = await Lawyer.findById(lawyerId);

      if (!lawyer) {
        return res.status(404).json({
          message: 'Selected lawyer not found'
        });
      }

      legalCase.lawyerId = lawyerId;
    }

    if (caseNumber !== undefined) legalCase.caseNumber = caseNumber;
    if (title !== undefined) legalCase.title = title;
    if (category !== undefined) legalCase.category = category;
    if (description !== undefined) legalCase.description = description;
    if (court !== undefined) legalCase.court = court;
    if (status !== undefined) legalCase.status = status;
    if (filingDate !== undefined) legalCase.filingDate = filingDate;
    if (nextHearingDate !== undefined) {
      legalCase.nextHearingDate = nextHearingDate;
    }
    if (notes !== undefined) legalCase.notes = notes;

    await legalCase.save();

    const updatedCase = await Case.findById(legalCase._id)
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization');

    res.status(200).json(updatedCase);
  } catch (error) {
    console.error('Update Case Error:', error);
    res.status(500).json({
      message: 'Failed to update case',
      error: error.message
    });
  }
};

// DELETE CASE
const deleteCase = async (req, res) => {
  try {
    const legalCase = await Case.findById(req.params.id);

    if (!legalCase) {
      return res.status(404).json({
        message: 'Case not found'
      });
    }

    await legalCase.deleteOne();

    res.status(200).json({
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Delete Case Error:', error);
    res.status(500).json({
      message: 'Failed to delete case',
      error: error.message
    });
  }
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase
};