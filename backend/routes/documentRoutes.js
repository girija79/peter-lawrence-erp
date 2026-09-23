const express = require('express');

const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin + Lawyer can view documents
router.get(
  '/',
  protect,
  authorize('admin', 'lawyer'),
  getDocuments
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'lawyer'),
  getDocumentById
);

// Only Admin can manage documents
router.post(
  '/',
  protect,
  authorize('admin'),
  createDocument
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  updateDocument
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteDocument
);

module.exports = router;