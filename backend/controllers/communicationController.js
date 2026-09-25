const Communication = require('../models/Communication');
const User = require('../models/User');

// Get communications
const getCommunications = async (req, res) => {
  try {
    const user = req.user;

    let communications = [];

    if (user.role === 'admin' || user.role === 'hr') {
      // Admin/HR can see messages they sent
      // and messages addressed to them
      communications = await Communication.find({
        $or: [
          { senderId: user._id },
          { recipientId: user._id },
          { recipientRole: user.role },
          { recipientRole: 'all' }
        ]
      })
        .populate('senderId', 'name email role')
        .populate('recipientId', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      // Other users can see:
      // 1. Messages sent directly to them
      // 2. Messages sent to their role
      // 3. Messages sent to everyone
      // 4. Messages they personally sent
      communications = await Communication.find({
        $or: [
          { senderId: user._id },
          { recipientId: user._id },
          { recipientRole: user.role },
          { recipientRole: 'all' }
        ]
      })
        .populate('senderId', 'name email role')
        .populate('recipientId', 'name email role')
        .sort({ createdAt: -1 });
    }

    res.json(communications);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch communications',
      error: error.message
    });
  }
};

// Get single communication
const getCommunicationById = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id)
      .populate('senderId', 'name email role')
      .populate('recipientId', 'name email role');

    if (!communication) {
      return res.status(404).json({
        message: 'Communication not found'
      });
    }

    const user = req.user;

    const isAdminOrHR =
      user.role === 'admin' || user.role === 'hr';

    const isSender =
      communication.senderId?._id.toString() === user._id.toString();

    const isRecipient =
      communication.recipientId &&
      communication.recipientId._id.toString() === user._id.toString();

    const isRoleRecipient =
      communication.recipientRole === user.role;

    const isAllRecipient =
      communication.recipientRole === 'all';

    if (
      !isAdminOrHR &&
      !isSender &&
      !isRecipient &&
      !isRoleRecipient &&
      !isAllRecipient
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json(communication);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch communication',
      error: error.message
    });
  }
};

// Create communication
const createCommunication = async (req, res) => {
  try {
    const {
      recipientId,
      recipientRole,
      subject,
      message,
      type,
      priority
    } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: 'Subject and message are required'
      });
    }

    if (!recipientId && !recipientRole) {
      return res.status(400).json({
        message: 'Recipient or recipient role is required'
      });
    }

    // Validate recipient user if provided
    if (recipientId) {
      const recipient = await User.findById(recipientId);

      if (!recipient) {
        return res.status(404).json({
          message: 'Recipient user not found'
        });
      }
    }

    const communication = await Communication.create({
      senderId: req.user._id,
      recipientId: recipientId || null,
      recipientRole: recipientRole || null,
      subject,
      message,
      type: type || 'General',
      priority: priority || 'Normal'
    });

    const populatedCommunication =
      await Communication.findById(communication._id)
        .populate('senderId', 'name email role')
        .populate('recipientId', 'name email role');

    res.status(201).json(populatedCommunication);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create communication',
      error: error.message
    });
  }
};

// Mark communication as read
const markCommunicationRead = async (req, res) => {
  try {
    const communication =
      await Communication.findById(req.params.id);

    if (!communication) {
      return res.status(404).json({
        message: 'Communication not found'
      });
    }

    const user = req.user;

    const isRecipient =
      communication.recipientId &&
      communication.recipientId.toString() ===
        user._id.toString();

    const isRoleRecipient =
      communication.recipientRole === user.role;

    const isAllRecipient =
      communication.recipientRole === 'all';

    if (
      !isRecipient &&
      !isRoleRecipient &&
      !isAllRecipient
    ) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    communication.isRead = true;
    communication.readAt = new Date();

    await communication.save();

    res.json({
      message: 'Communication marked as read',
      communication
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to mark communication as read',
      error: error.message
    });
  }
};

// Delete communication
const deleteCommunication = async (req, res) => {
  try {
    const communication =
      await Communication.findById(req.params.id);

    if (!communication) {
      return res.status(404).json({
        message: 'Communication not found'
      });
    }

    await communication.deleteOne();

    res.json({
      message: 'Communication deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete communication',
      error: error.message
    });
  }
};

module.exports = {
  getCommunications,
  getCommunicationById,
  createCommunication,
  markCommunicationRead,
  deleteCommunication
};