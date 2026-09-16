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

router.get('/', protect, authorize('admin'), getDocuments);
router.get('/:id', protect, authorize('admin'), getDocumentById);
router.post('/', protect, authorize('admin'), createDocument);
router.put('/:id', protect, authorize('admin'), updateDocument);
router.delete('/:id', protect, authorize('admin'), deleteDocument);

module.exports = router;