const Performance = require('../models/Performance');
const Employee = require('../models/Employee');
const User = require('../models/User');


// ==========================================
// GET ALL PERFORMANCE REVIEWS
// Admin + HR
// ==========================================

const getPerformances = async (req, res) => {
  try {
    const performances = await Performance.find()
      .populate(
        'employeeId',
        'employeeId fullName department designation'
      )
      .populate(
        'reviewerId',
        'name email role'
      )
      .populate(
        'finalizedBy',
        'name email role'
      )
      .sort({
        reviewDate: -1,
        createdAt: -1
      });

    res.json(performances);

  } catch (error) {
    console.error(
      'GET PERFORMANCE ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to fetch performance reviews',
      error: error.message
    });
  }
};


// ==========================================
// GET MY PERFORMANCE REVIEWS
// Employee only
// ==========================================

const getMyPerformances = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id
    });

    if (!employee) {
      return res.status(404).json({
        message: 'Employee profile not found'
      });
    }

    const performances = await Performance.find({
      employeeId: employee._id
    })
      .populate(
        'employeeId',
        'employeeId fullName department designation'
      )
      .populate(
        'reviewerId',
        'name email role'
      )
      .populate(
        'finalizedBy',
        'name email role'
      )
      .sort({
        reviewDate: -1,
        createdAt: -1
      });

    res.json(performances);

  } catch (error) {
    console.error(
      'GET MY PERFORMANCE ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to fetch your performance reviews',
      error: error.message
    });
  }
};


// ==========================================
// GET PERFORMANCE BY ID
// Admin + HR + Employee
// ==========================================

const getPerformanceById = async (req, res) => {
  try {
    const performance =
      await Performance.findById(
        req.params.id
      )
        .populate(
          'employeeId',
          'employeeId fullName department designation'
        )
        .populate(
          'reviewerId',
          'name email role'
        )
        .populate(
          'finalizedBy',
          'name email role'
        );

    if (!performance) {
      return res.status(404).json({
        message: 'Performance review not found'
      });
    }

    // ======================================
    // EMPLOYEE OWNERSHIP CHECK
    // ======================================

    if (req.user.role === 'employee') {

      const employee =
        await Employee.findOne({
          userId: req.user._id
        });

      if (
        !employee ||
        performance.employeeId._id.toString() !==
          employee._id.toString()
      ) {
        return res.status(403).json({
          message:
            'Access denied. You can only view your own performance reviews.'
        });
      }
    }

    res.json(performance);

  } catch (error) {
    console.error(
      'GET PERFORMANCE BY ID ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to fetch performance review',
      error: error.message
    });
  }
};


// ==========================================
// CREATE PERFORMANCE REVIEW
// Admin + HR
// ==========================================

const createPerformance = async (req, res) => {
  try {

    const {
      employeeId,
      reviewType,
      reviewPeriod,
      reviewDate,
      dueDate,
      goals,
      achievements,
      strengths,
      areasForImprovement,
      developmentPlan,
      rating,
      managerComments,
      employeeComments,
      status
    } = req.body;


    // ======================================
    // REQUIRED VALIDATION
    // ======================================

    if (
      !employeeId ||
      !reviewPeriod ||
      !reviewDate ||
      rating === undefined
    ) {
      return res.status(400).json({
        message:
          'Employee, review period, review date and rating are required.'
      });
    }


    // ======================================
    // RATING VALIDATION
    // ======================================

    if (
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message:
          'Rating must be between 1 and 5.'
      });
    }


    // ======================================
    // EMPLOYEE VALIDATION
    // ======================================

    const employee =
      await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: 'Employee not found.'
      });
    }


    // ======================================
    // REVIEWER VALIDATION
    // ======================================

    const reviewer =
      await User.findById(req.user._id);

    if (!reviewer) {
      return res.status(404).json({
        message: 'Reviewer not found.'
      });
    }


    // ======================================
    // CREATE
    // ======================================

    const performance =
      await Performance.create({

        employeeId,

        reviewerId:
          req.user._id,

        reviewType:
          reviewType ||
          'Annual Review',

        reviewPeriod,

        reviewDate,

        dueDate:
          dueDate || null,

        goals:
          goals || '',

        achievements:
          achievements || '',

        strengths:
          strengths || '',

        areasForImprovement:
          areasForImprovement || '',

        developmentPlan:
          developmentPlan || '',

        rating:
          Number(rating),

        managerComments:
          managerComments || '',

        employeeComments:
          employeeComments || '',

        status:
          status || 'Draft',

        reviewedAt:
          status === 'Reviewed' ||
          status === 'Finalized'
            ? new Date()
            : null,

        finalizedAt:
          status === 'Finalized'
            ? new Date()
            : null,

        finalizedBy:
          status === 'Finalized'
            ? req.user._id
            : null
      });


    // ======================================
    // RETURN POPULATED RECORD
    // ======================================

    const populatedPerformance =
      await Performance.findById(
        performance._id
      )
        .populate(
          'employeeId',
          'employeeId fullName department designation'
        )
        .populate(
          'reviewerId',
          'name email role'
        )
        .populate(
          'finalizedBy',
          'name email role'
        );

    res.status(201).json(
      populatedPerformance
    );

  } catch (error) {

    console.error(
      'CREATE PERFORMANCE ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to create performance review',
      error: error.message
    });
  }
};


// ==========================================
// UPDATE PERFORMANCE REVIEW
// Admin + HR
// ==========================================

const updatePerformance = async (req, res) => {
  try {

    const performance =
      await Performance.findById(
        req.params.id
      );

    if (!performance) {
      return res.status(404).json({
        message:
          'Performance review not found.'
      });
    }


    // ======================================
    // EMPLOYEE VALIDATION
    // ======================================

    if (req.body.employeeId) {

      const employee =
        await Employee.findById(
          req.body.employeeId
        );

      if (!employee) {
        return res.status(404).json({
          message: 'Employee not found.'
        });
      }

    }


    // ======================================
    // RATING VALIDATION
    // ======================================

    if (
      req.body.rating !== undefined &&
      (
        Number(req.body.rating) < 1 ||
        Number(req.body.rating) > 5
      )
    ) {
      return res.status(400).json({
        message:
          'Rating must be between 1 and 5.'
      });
    }


    // ======================================
    // ALLOWED FIELDS
    // ======================================

    const allowedFields = [
      'employeeId',
      'reviewType',
      'reviewPeriod',
      'reviewDate',
      'dueDate',
      'goals',
      'achievements',
      'strengths',
      'areasForImprovement',
      'developmentPlan',
      'rating',
      'managerComments',
      'employeeComments',
      'status'
    ];


    allowedFields.forEach(
      (field) => {

        if (
          req.body[field] !==
          undefined
        ) {

          performance[field] =
            req.body[field];

        }

      }
    );


    // ======================================
    // STATUS WORKFLOW
    // ======================================

    if (
      req.body.status === 'Reviewed'
    ) {

      performance.reviewedAt =
        new Date();

    }


    if (
      req.body.status === 'Finalized'
    ) {

      performance.reviewedAt =
        performance.reviewedAt ||
        new Date();

      performance.finalizedAt =
        new Date();

      performance.finalizedBy =
        req.user._id;

    }


    // If moved backwards from Finalized
    if (
      req.body.status &&
      req.body.status !== 'Finalized'
    ) {

      performance.finalizedAt =
        null;

      performance.finalizedBy =
        null;

    }


    await performance.save();


    // ======================================
    // RETURN UPDATED RECORD
    // ======================================

    const updatedPerformance =
      await Performance.findById(
        performance._id
      )
        .populate(
          'employeeId',
          'employeeId fullName department designation'
        )
        .populate(
          'reviewerId',
          'name email role'
        )
        .populate(
          'finalizedBy',
          'name email role'
        );

    res.json(
      updatedPerformance
    );

  } catch (error) {

    console.error(
      'UPDATE PERFORMANCE ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to update performance review',
      error: error.message
    });
  }
};


// ==========================================
// DELETE PERFORMANCE REVIEW
// Admin only
// ==========================================

const deletePerformance = async (
  req,
  res
) => {

  try {

    const performance =
      await Performance.findById(
        req.params.id
      );

    if (!performance) {
      return res.status(404).json({
        message:
          'Performance review not found.'
      });
    }


    await performance.deleteOne();


    res.json({
      message:
        'Performance review deleted successfully.'
    });

  } catch (error) {

    console.error(
      'DELETE PERFORMANCE ERROR:',
      error
    );

    res.status(500).json({
      message:
        'Failed to delete performance review',
      error: error.message
    });
  }
};


module.exports = {
  getPerformances,
  getMyPerformances,
  getPerformanceById,
  createPerformance,
  updatePerformance,
  deletePerformance
};