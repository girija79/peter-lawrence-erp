const Document = require('../models/Document');
const Client = require('../models/Client');
const Case = require('../models/Case');
const Lawyer = require('../models/Lawyer');

// Get all documents
const getDocuments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({
        userId: req.user._id
      });

      if (!lawyer) {
        return res.status(404).json({
          message: 'Lawyer profile not found'
        });
      }

      const assignedCases = await Case.find({
        lawyerId: lawyer._id
      }).select('_id');

      const caseIds = assignedCases.map(
        (legalCase) => legalCase._id
      );

      query.caseId = { $in: caseIds };
    }

    const documents = await Document.find(query)
      .populate('clientId', 'fullName email phone')
      .populate('caseId', 'caseNumber title')
      .sort({ createdAt: -1 });

    res.json(documents);

  } catch (error) {
    console.error('DOCUMENT ERROR:', error);

    res.status(500).json({
      message: 'Failed to fetch documents',
      error: error.message,
      stack: error.stack
    });
  }
};
// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('clientId', 'fullName email phone')
      .populate('caseId', 'caseNumber title');

    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

// Create document
const createDocument = async (req, res) => {
  try {
    const {
      documentName,
      documentType,
      clientId,
      caseId,
      fileName,
      fileUrl,
      description,
      status
    } = req.body;

    if (!documentName || !clientId) {
      return res.status(400).json({
        message: 'Document name and client are required'
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    if (caseId) {
      const caseRecord = await Case.findById(caseId);

      if (!caseRecord) {
        return res.status(404).json({
          message: 'Case not found'
        });
      }
    }

    const document = await Document.create({
      documentName,
      documentType,
      clientId,
      caseId: caseId || null,
      fileName,
      fileUrl,
      description,
      status
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('clientId', 'fullName email phone')
      .populate('caseId', 'caseNumber title');

    res.status(201).json(populatedDocument);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create document',
      error: error.message
    });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }

    if (req.body.clientId) {
      const client = await Client.findById(req.body.clientId);

      if (!client) {
        return res.status(404).json({
          message: 'Client not found'
        });
      }
    }

    if (req.body.caseId) {
      const caseRecord = await Case.findById(req.body.caseId);

      if (!caseRecord) {
        return res.status(404).json({
          message: 'Case not found'
        });
      }
    }

    const allowedFields = [
      'documentName',
      'documentType',
      'clientId',
      'caseId',
      'fileName',
      'fileUrl',
      'description',
      'status'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        document[field] = req.body[field];
      }
    });

    await document.save();

    const updatedDocument = await Document.findById(document._id)
      .populate('clientId', 'fullName email phone')
      .populate('caseId', 'caseNumber title');

    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update document',
      error: error.message
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }

    await document.deleteOne();

    res.json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};