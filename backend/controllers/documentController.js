const Document = require('../models/Document');
const Client = require('../models/Client');
const Case = require('../models/Case');
const Employee = require('../models/Employee');
const Lawyer = require('../models/Lawyer');


// ======================================================
// HELPER: Populate document
// ======================================================

const populateDocument = (query) => {
  return query
    .populate(
      'clientId',
      'fullName email phone'
    )
    .populate(
      'employeeId',
      'employeeId fullName department designation'
    )
    .populate(
      'caseId',
      'caseNumber title'
    )
    .populate(
      'uploadedBy',
      'name email role'
    );
};


// ======================================================
// GET ALL DOCUMENTS
// Admin + HR + Lawyer
// ======================================================

const getDocuments = async (req, res) => {
  try {
    let query = {};

    // --------------------------------------------------
    // LAWYER
    // Only documents connected to assigned cases
    // --------------------------------------------------

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

      query.caseId = {
        $in: caseIds
      };
    }


    // --------------------------------------------------
    // HR
    // Only HR / Employee / Identity documents
    // --------------------------------------------------

    if (req.user.role === 'hr') {
      query.documentCategory = {
        $in: [
          'HR',
          'Employee',
          'Identity'
        ]
      };
    }


    const documents = await populateDocument(
      Document.find(query)
    ).sort({
      createdAt: -1
    });


    res.json(documents);

  } catch (error) {
    console.error(
      'GET DOCUMENTS ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};


// ======================================================
// GET MY EMPLOYEE DOCUMENTS
// Employee
// ======================================================

const getMyDocuments = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee profile not found'
      });
    }


    const documents = await populateDocument(
      Document.find({
        employeeId: employee._id
      })
    ).sort({
      createdAt: -1
    });


    res.json(documents);

  } catch (error) {
    console.error(
      'GET MY DOCUMENTS ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to fetch your documents',
      error: error.message
    });
  }
};


// ======================================================
// GET MY CLIENT DOCUMENTS
// Client
// ======================================================

const getMyClientDocuments = async (req, res) => {
  try {
    const client = await Client.findOne({
      userId: req.user._id
    });

    if (!client) {
      return res.status(404).json({
        message: 'Client profile not found'
      });
    }


    const documents = await populateDocument(
      Document.find({
        clientId: client._id
      })
    ).sort({
      createdAt: -1
    });


    res.json(documents);

  } catch (error) {
    console.error(
      'GET MY CLIENT DOCUMENTS ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to fetch your documents',
      error: error.message
    });
  }
};


// ======================================================
// GET DOCUMENT BY ID
// Admin + HR + Lawyer + Employee + Client
// ======================================================

const getDocumentById = async (req, res) => {
  try {
    const document = await populateDocument(
      Document.findById(req.params.id)
    );


    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }


    // --------------------------------------------------
    // EMPLOYEE
    // Can only view own employee documents
    // --------------------------------------------------

    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({
        userId: req.user._id
      });

      if (
        !employee ||
        !document.employeeId ||
        document.employeeId._id.toString() !==
          employee._id.toString()
      ) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }
    }


    // --------------------------------------------------
    // CLIENT
    // Can only view own client documents
    // --------------------------------------------------

    if (req.user.role === 'client') {
      const client = await Client.findOne({
        userId: req.user._id
      });

      if (
        !client ||
        !document.clientId ||
        document.clientId._id.toString() !==
          client._id.toString()
      ) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }
    }


    // --------------------------------------------------
    // HR
    // Only HR / Employee / Identity documents
    // --------------------------------------------------

    if (req.user.role === 'hr') {
      const allowedCategories = [
        'HR',
        'Employee',
        'Identity'
      ];

      if (
        !allowedCategories.includes(
          document.documentCategory
        )
      ) {
        return res.status(403).json({
          message:
            'Access denied: this document is not an HR document'
        });
      }
    }


    // --------------------------------------------------
    // LAWYER
    // Only documents related to assigned cases
    // --------------------------------------------------

    if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({
        userId: req.user._id
      });

      if (!lawyer) {
        return res.status(404).json({
          message: 'Lawyer profile not found'
        });
      }

      if (!document.caseId) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const legalCase = await Case.findOne({
        _id: document.caseId._id,
        lawyerId: lawyer._id
      });

      if (!legalCase) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }
    }


    res.json(document);

  } catch (error) {
    console.error(
      'GET DOCUMENT BY ID ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};


// ======================================================
// CREATE DOCUMENT
// Admin + HR
// ======================================================

const createDocument = async (req, res) => {
  try {
    const {
      documentName,
      documentCategory,
      documentType,
      clientId,
      employeeId,
      caseId,
      fileName,
      fileUrl,
      description,
      status
    } = req.body;


    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

    if (!documentName) {
      return res.status(400).json({
        message: 'Document name is required'
      });
    }


    // --------------------------------------------------
    // HR restrictions
    // --------------------------------------------------

    if (req.user.role === 'hr') {
      const allowedCategories = [
        'HR',
        'Employee',
        'Identity'
      ];

      if (!employeeId) {
        return res.status(400).json({
          message:
            'HR documents must be linked to an employee'
        });
      }

      if (
        documentCategory &&
        !allowedCategories.includes(
          documentCategory
        )
      ) {
        return res.status(403).json({
          message:
            'HR can only create HR and employee documents'
        });
      }

      // HR cannot create legal/client/case documents
      if (clientId || caseId) {
        return res.status(403).json({
          message:
            'HR cannot create client or legal case documents'
        });
      }
    }


    // --------------------------------------------------
    // Owner validation
    // --------------------------------------------------

    if (!clientId && !employeeId) {
      return res.status(400).json({
        message:
          'Client or employee is required'
      });
    }


    // --------------------------------------------------
    // Validate client
    // --------------------------------------------------

    if (clientId) {
      const client = await Client.findById(
        clientId
      );

      if (!client) {
        return res.status(404).json({
          message: 'Client not found'
        });
      }
    }


    // --------------------------------------------------
    // Validate employee
    // --------------------------------------------------

    if (employeeId) {
      const employee = await Employee.findById(
        employeeId
      );

      if (!employee) {
        return res.status(404).json({
          message: 'Employee not found'
        });
      }
    }


    // --------------------------------------------------
    // Validate case
    // --------------------------------------------------

    if (caseId) {
      const caseRecord = await Case.findById(
        caseId
      );

      if (!caseRecord) {
        return res.status(404).json({
          message: 'Case not found'
        });
      }
    }


    // --------------------------------------------------
    // Employee documents cannot belong to a case
    // --------------------------------------------------

    if (employeeId && caseId) {
      return res.status(400).json({
        message:
          'Employee documents cannot be linked to a legal case'
      });
    }


    // --------------------------------------------------
    // Client documents should not belong to employee
    // --------------------------------------------------

    if (clientId && employeeId) {
      return res.status(400).json({
        message:
          'A document cannot belong to both a client and employee'
      });
    }


    // --------------------------------------------------
    // Create document
    // --------------------------------------------------

    const document = await Document.create({
      documentName,
      documentCategory:
        documentCategory || 'Other',
      documentType:
        documentType || 'Other',

      clientId:
        clientId || null,

      employeeId:
        employeeId || null,

      caseId:
        caseId || null,

      uploadedBy:
        req.user._id,

      fileName:
        fileName || '',

      fileUrl:
        fileUrl || '',

      description:
        description || '',

      status:
        status || 'Active'
    });


    const populatedDocument =
      await populateDocument(
        Document.findById(
          document._id
        )
      );


    res.status(201).json(
      populatedDocument
    );

  } catch (error) {
    console.error(
      'CREATE DOCUMENT ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to create document',
      error: error.message
    });
  }
};


// ======================================================
// UPDATE DOCUMENT
// Admin + HR
// ======================================================

const updateDocument = async (req, res) => {
  try {
    const document =
      await Document.findById(
        req.params.id
      );


    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }


    // --------------------------------------------------
    // HR restrictions
    // --------------------------------------------------

    if (req.user.role === 'hr') {
      const allowedCategories = [
        'HR',
        'Employee',
        'Identity'
      ];

      // Existing document must be HR-related
      if (
        !allowedCategories.includes(
          document.documentCategory
        )
      ) {
        return res.status(403).json({
          message:
            'HR cannot modify this document'
        });
      }

      // New category must remain HR-related
      if (
        req.body.documentCategory &&
        !allowedCategories.includes(
          req.body.documentCategory
        )
      ) {
        return res.status(403).json({
          message:
            'HR can only use HR-related document categories'
        });
      }

      // HR cannot attach client/case
      if (
        req.body.clientId ||
        req.body.caseId
      ) {
        return res.status(403).json({
          message:
            'HR cannot link HR documents to clients or legal cases'
        });
      }
    }


    // --------------------------------------------------
    // Validate client
    // --------------------------------------------------

    if (req.body.clientId) {
      const client = await Client.findById(
        req.body.clientId
      );

      if (!client) {
        return res.status(404).json({
          message: 'Client not found'
        });
      }
    }


    // --------------------------------------------------
    // Validate employee
    // --------------------------------------------------

    if (req.body.employeeId) {
      const employee = await Employee.findById(
        req.body.employeeId
      );

      if (!employee) {
        return res.status(404).json({
          message: 'Employee not found'
        });
      }
    }


    // --------------------------------------------------
    // Validate case
    // --------------------------------------------------

    if (req.body.caseId) {
      const caseRecord = await Case.findById(
        req.body.caseId
      );

      if (!caseRecord) {
        return res.status(404).json({
          message: 'Case not found'
        });
      }
    }


    // --------------------------------------------------
    // Determine final ownership
    // --------------------------------------------------

    const finalClientId =
      req.body.clientId !== undefined
        ? req.body.clientId
        : document.clientId;

    const finalEmployeeId =
      req.body.employeeId !== undefined
        ? req.body.employeeId
        : document.employeeId;

    const finalCaseId =
      req.body.caseId !== undefined
        ? req.body.caseId
        : document.caseId;


    // --------------------------------------------------
    // Ownership consistency
    // --------------------------------------------------

    if (
      finalEmployeeId &&
      finalCaseId
    ) {
      return res.status(400).json({
        message:
          'Employee documents cannot be linked to a legal case'
      });
    }


    if (
      finalClientId &&
      finalEmployeeId
    ) {
      return res.status(400).json({
        message:
          'A document cannot belong to both a client and employee'
      });
    }


    // --------------------------------------------------
    // Allowed fields
    // --------------------------------------------------

    const allowedFields = [
      'documentName',
      'documentCategory',
      'documentType',
      'clientId',
      'employeeId',
      'caseId',
      'fileName',
      'fileUrl',
      'description',
      'status'
    ];


    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        document[field] =
          req.body[field];
      }
    });


    // --------------------------------------------------
    // HR final protection
    // --------------------------------------------------

    if (req.user.role === 'hr') {
      if (!document.employeeId) {
        return res.status(403).json({
          message:
            'HR documents must belong to an employee'
        });
      }

      document.clientId = null;
      document.caseId = null;
    }


    await document.save();


    const updatedDocument =
      await populateDocument(
        Document.findById(
          document._id
        )
      );


    res.json(
      updatedDocument
    );

  } catch (error) {
    console.error(
      'UPDATE DOCUMENT ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to update document',
      error: error.message
    });
  }
};


// ======================================================
// DELETE DOCUMENT
// Admin only
// ======================================================

const deleteDocument = async (req, res) => {
  try {
    const document =
      await Document.findById(
        req.params.id
      );


    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }


    await document.deleteOne();


    res.json({
      message:
        'Document deleted successfully'
    });

  } catch (error) {
    console.error(
      'DELETE DOCUMENT ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to delete document',
      error: error.message
    });
  }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  getDocuments,
  getDocumentById,
  getMyDocuments,
  getMyClientDocuments,
  createDocument,
  updateDocument,
  deleteDocument
};