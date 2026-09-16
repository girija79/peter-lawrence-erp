const Career = require('../models/Career');

// Get all jobs
const getCareers = async (req, res) => {
  try {
    const careers = await Career.find()
      .sort({ createdAt: -1 });

    res.json(careers);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch career records.'
    });
  }
};

// Get job by ID
const getCareerById = async (req, res) => {
  try {
    const career = await Career.findById(
      req.params.id
    );

    if (!career) {
      return res.status(404).json({
        message: 'Career record not found.'
      });
    }

    res.json(career);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch career record.'
    });
  }
};

// Create job
const createCareer = async (req, res) => {
  try {
    const {
      jobId,
      jobTitle,
      department,
      employmentType,
      location,
      description,
      requirements,
      salaryRange,
      openingDate,
      closingDate,
      status,
      vacancies,
      notes
    } = req.body;

    if (
      !jobId ||
      !jobTitle ||
      !openingDate
    ) {
      return res.status(400).json({
        message:
          'Job ID, job title and opening date are required.'
      });
    }

    const existingCareer =
      await Career.findOne({
        jobId: jobId.trim()
      });

    if (existingCareer) {
      return res.status(400).json({
        message: 'Job ID already exists.'
      });
    }

    const career = await Career.create({
      jobId: jobId.trim(),
      jobTitle: jobTitle.trim(),
      department,
      employmentType,
      location: location?.trim() || '',
      description: description?.trim() || '',
      requirements: requirements?.trim() || '',
      salaryRange: salaryRange?.trim() || '',
      openingDate,
      closingDate: closingDate || null,
      status,
      vacancies: Number(vacancies || 1),
      notes: notes?.trim() || ''
    });

    res.status(201).json(career);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create career record.'
    });
  }
};

// Update job
const updateCareer = async (req, res) => {
  try {
    const career = await Career.findById(
      req.params.id
    );

    if (!career) {
      return res.status(404).json({
        message: 'Career record not found.'
      });
    }

    const {
      jobId,
      jobTitle,
      department,
      employmentType,
      location,
      description,
      requirements,
      salaryRange,
      openingDate,
      closingDate,
      status,
      vacancies,
      notes
    } = req.body;

    if (
      !jobId ||
      !jobTitle ||
      !openingDate
    ) {
      return res.status(400).json({
        message:
          'Job ID, job title and opening date are required.'
      });
    }

    const duplicateCareer =
      await Career.findOne({
        jobId: jobId.trim(),
        _id: { $ne: req.params.id }
      });

    if (duplicateCareer) {
      return res.status(400).json({
        message: 'Job ID already exists.'
      });
    }

    career.jobId = jobId.trim();
    career.jobTitle = jobTitle.trim();
    career.department = department;
    career.employmentType = employmentType;
    career.location =
      location?.trim() || '';
    career.description =
      description?.trim() || '';
    career.requirements =
      requirements?.trim() || '';
    career.salaryRange =
      salaryRange?.trim() || '';
    career.openingDate = openingDate;
    career.closingDate =
      closingDate || null;
    career.status = status;
    career.vacancies =
      Number(vacancies || 1);
    career.notes =
      notes?.trim() || '';

    const updatedCareer =
      await career.save();

    res.json(updatedCareer);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update career record.'
    });
  }
};

// Delete job
const deleteCareer = async (req, res) => {
  try {
    const career = await Career.findById(
      req.params.id
    );

    if (!career) {
      return res.status(404).json({
        message: 'Career record not found.'
      });
    }

    await career.deleteOne();

    res.json({
      message:
        'Career record deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message:
        'Failed to delete career record.'
    });
  }
};

module.exports = {
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer
};