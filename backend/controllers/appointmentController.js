const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Lawyer = require('../models/Lawyer');

// Get all appointments
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get Appointments Error:', error);

    res.status(500).json({
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get single appointment
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get Appointment Error:', error);

    res.status(500).json({
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const {
      clientId,
      lawyerId,
      title,
      appointmentType,
      appointmentDate,
      location,
      status,
      purpose,
      notes
    } = req.body;

    if (!clientId || !lawyerId || !title || !appointmentDate) {
      return res.status(400).json({
        message:
          'Client, lawyer, title and appointment date are required'
      });
    }

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        message: 'Selected client not found'
      });
    }

    const lawyer = await Lawyer.findById(lawyerId);

    if (!lawyer) {
      return res.status(404).json({
        message: 'Selected lawyer not found'
      });
    }

    const appointment = await Appointment.create({
      clientId,
      lawyerId,
      title,
      appointmentType,
      appointmentDate,
      location,
      status,
      purpose,
      notes
    });

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Create Appointment Error:', error);

    res.status(500).json({
      message: 'Failed to create appointment',
      error: error.message
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    const {
      clientId,
      lawyerId,
      title,
      appointmentType,
      appointmentDate,
      location,
      status,
      purpose,
      notes
    } = req.body;

    if (clientId) {
      const client = await Client.findById(clientId);

      if (!client) {
        return res.status(404).json({
          message: 'Selected client not found'
        });
      }

      appointment.clientId = clientId;
    }

    if (lawyerId) {
      const lawyer = await Lawyer.findById(lawyerId);

      if (!lawyer) {
        return res.status(404).json({
          message: 'Selected lawyer not found'
        });
      }

      appointment.lawyerId = lawyerId;
    }

    if (title !== undefined) appointment.title = title;
    if (appointmentType !== undefined)
      appointment.appointmentType = appointmentType;
    if (appointmentDate !== undefined)
      appointment.appointmentDate = appointmentDate;
    if (location !== undefined)
      appointment.location = location;
    if (status !== undefined)
      appointment.status = status;
    if (purpose !== undefined)
      appointment.purpose = purpose;
    if (notes !== undefined)
      appointment.notes = notes;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate('clientId', 'fullName email phone')
      .populate('lawyerId', 'fullName email specialization');

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update Appointment Error:', error);

    res.status(500).json({
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    await appointment.deleteOne();

    res.json({
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete Appointment Error:', error);

    res.status(500).json({
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};