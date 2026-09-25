const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    // ==========================================
    // EMPLOYEE
    // ==========================================

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true
    },

    // ==========================================
    // REVIEWER
    // ==========================================

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // ==========================================
    // REVIEW INFORMATION
    // ==========================================

    reviewType: {
      type: String,
      enum: [
        'Annual Review',
        'Quarterly Review',
        'Mid-Year Review',
        'Probation Review',
        'Promotion Review',
        'Performance Improvement'
      ],
      default: 'Annual Review',
      trim: true
    },

    reviewPeriod: {
      type: String,
      required: true,
      trim: true
    },

    reviewDate: {
      type: Date,
      required: true
    },

    dueDate: {
      type: Date,
      default: null
    },

    // ==========================================
    // PERFORMANCE CONTENT
    // ==========================================

    goals: {
      type: String,
      default: '',
      trim: true
    },

    achievements: {
      type: String,
      default: '',
      trim: true
    },

    strengths: {
      type: String,
      default: '',
      trim: true
    },

    areasForImprovement: {
      type: String,
      default: '',
      trim: true
    },

    developmentPlan: {
      type: String,
      default: '',
      trim: true
    },

    // ==========================================
    // RATING
    // ==========================================

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    // ==========================================
    // FEEDBACK
    // ==========================================

    managerComments: {
      type: String,
      default: '',
      trim: true
    },

    employeeComments: {
      type: String,
      default: '',
      trim: true
    },

    // ==========================================
    // REVIEW STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Reviewed',
        'Finalized'
      ],
      default: 'Draft',
      index: true
    },

    // ==========================================
    // WORKFLOW TRACKING
    // ==========================================

    reviewedAt: {
      type: Date,
      default: null
    },

    finalizedAt: {
      type: Date,
      default: null
    },

    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// INDEXES
// ==========================================

performanceSchema.index({
  employeeId: 1,
  reviewDate: -1
});

performanceSchema.index({
  status: 1,
  reviewDate: -1
});

module.exports = mongoose.model(
  'Performance',
  performanceSchema
);