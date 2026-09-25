const express = require('express');

const {
  getDocuments,
  getDocumentById,
  getMyDocuments,
  getMyClientDocuments,
  createDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();


// ======================================================
// VIEW DOCUMENTS
// ======================================================

// Admin + Lawyer + HR
// View documents according to their access rules
router.get(
  '/',
  protect,
  authorize('admin', 'lawyer', 'hr'),
  getDocuments
);


// ======================================================
// EMPLOYEE DOCUMENTS
// ======================================================

// Employee can view only their own documents
// IMPORTANT: keep before /:id
router.get(
  '/me',
  protect,
  authorize('employee'),
  getMyDocuments
);


// ======================================================
// CLIENT DOCUMENTS
// ======================================================

// Client can view only their own documents
// IMPORTANT: keep before /:id
router.get(
  '/my-client-documents',
  protect,
  authorize('client'),
  getMyClientDocuments
);


// ======================================================
// VIEW SINGLE DOCUMENT
// ======================================================

// Admin + Lawyer + HR + Employee + Client
//
// Actual access is checked inside controller based on role.
router.get(
  '/:id',
  protect,
  authorize(
    'admin',
    'lawyer',
    'hr',
    'employee',
    'client'
  ),
  getDocumentById
);


// ======================================================
// CREATE DOCUMENT
// ======================================================

// Admin + HR
router.post(
  '/',
  protect,
  authorize('admin', 'hr'),
  createDocument
);


// ======================================================
// UPDATE DOCUMENT
// ======================================================

// Admin + HR
router.put(
  '/:id',
  protect,
  authorize('admin', 'hr'),
  updateDocument
);


// ======================================================
// DELETE DOCUMENT
// ======================================================

// Only Admin can permanently delete documents
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteDocument
);


module.exports = router;