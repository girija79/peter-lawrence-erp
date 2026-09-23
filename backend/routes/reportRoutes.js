const express = require('express');

const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getAnalytics
} = require('../controllers/reportController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Admin-only report management
router.get('/', protect, authorize('admin'), getReports);
router.get('/analytics/summary', protect, authorize('admin'), getAnalytics);
router.get('/:id', protect, authorize('admin'), getReportById);
router.post('/', protect, authorize('admin'), createReport);
router.put('/:id', protect, authorize('admin'), updateReport);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;