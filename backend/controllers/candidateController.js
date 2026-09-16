const Candidate = require('../models/Candidate');

// Get all candidates
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch candidates.'
    });
  }
};

// Get candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        message: 'Candidate not found.'
      });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch candidate.'
    });
  }
};

// Create candidate
const createCandidate = async (req, res) => {
  try {
    const {
      candidateId,
      fullName,
      email,
      phone,
      positionApplied,
      department,
      applicationDate,
      experience,
      qualification,
      resumeUrl,
      interviewDate,
      interviewStatus,
      status,
      notes
    } = req.body;

    if (
      !candidateId ||
      !fullName ||
      !email ||
      !positionApplied ||
      !applicationDate
    ) {
      return res.status(400).json({
        message:
          'Candidate ID, full name, email, position applied and application date are required.'
      });
    }

    const existingCandidate = await Candidate.findOne({
      candidateId: candidateId.trim()
    });

    if (existingCandidate) {
      return res.status(400).json({
        message: 'Candidate ID already exists.'
      });
    }

    const candidate = await Candidate.create({
      candidateId: candidateId.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      positionApplied: positionApplied.trim(),
      department,
      applicationDate,
      experience: Number(experience || 0),
      qualification: qualification?.trim() || '',
      resumeUrl: resumeUrl?.trim() || '',
      interviewDate: interviewDate || null,
      interviewStatus,
      status,
      notes: notes?.trim() || ''
    });

    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create candidate.'
    });
  }
};

// Update candidate
const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(
      req.params.id
    );

    if (!candidate) {
      return res.status(404).json({
        message: 'Candidate not found.'
      });
    }

    const {
      candidateId,
      fullName,
      email,
      phone,
      positionApplied,
      department,
      applicationDate,
      experience,
      qualification,
      resumeUrl,
      interviewDate,
      interviewStatus,
      status,
      notes
    } = req.body;

    if (
      !candidateId ||
      !fullName ||
      !email ||
      !positionApplied ||
      !applicationDate
    ) {
      return res.status(400).json({
        message:
          'Candidate ID, full name, email, position applied and application date are required.'
      });
    }

    const duplicateCandidate =
      await Candidate.findOne({
        candidateId: candidateId.trim(),
        _id: { $ne: req.params.id }
      });

    if (duplicateCandidate) {
      return res.status(400).json({
        message: 'Candidate ID already exists.'
      });
    }

    candidate.candidateId = candidateId.trim();
    candidate.fullName = fullName.trim();
    candidate.email = email.trim();
    candidate.phone = phone?.trim() || '';
    candidate.positionApplied =
      positionApplied.trim();
    candidate.department = department;
    candidate.applicationDate = applicationDate;
    candidate.experience =
      Number(experience || 0);
    candidate.qualification =
      qualification?.trim() || '';
    candidate.resumeUrl =
      resumeUrl?.trim() || '';
    candidate.interviewDate =
      interviewDate || null;
    candidate.interviewStatus =
      interviewStatus;
    candidate.status = status;
    candidate.notes = notes?.trim() || '';

    const updatedCandidate =
      await candidate.save();

    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update candidate.'
    });
  }
};

// Delete candidate
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(
      req.params.id
    );

    if (!candidate) {
      return res.status(404).json({
        message: 'Candidate not found.'
      });
    }

    await candidate.deleteOne();

    res.json({
      message: 'Candidate deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete candidate.'
    });
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
};