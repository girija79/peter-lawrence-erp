const User = require("../models/User");
const Notification = require("../models/Notification");
const CmsInquiry = require("../models/CmsInquiry");

// GET /api/cms-inquiries
const getCmsInquiries = async (req, res) => {
  try {
    const inquiries = await CmsInquiry.find()
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    console.error("Get CMS inquiries error:", error);

    res.status(500).json({
      message: "Failed to fetch inquiries",
    });
  }
};

// GET /api/cms-inquiries/:id
const getCmsInquiryById = async (req, res) => {
  try {
    const inquiry = await CmsInquiry.findById(req.params.id).populate(
      "assignedTo",
      "name email role",
    );

    if (!inquiry) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }

    res.json(inquiry);
  } catch (error) {
    console.error("Get CMS inquiry error:", error);

    res.status(500).json({
      message: "Failed to fetch inquiry",
    });
  }
};

// POST /api/cms-inquiries
const createCmsInquiry = async (req, res) => {
  try {
    const {
      inquiryNumber,
      fullName,
      email,
      phone,
      subject,
      message,
      inquiryType,
      status,
      assignedTo,
      adminNotes,
    } = req.body;

    if (!inquiryNumber || !fullName || !email || !subject || !message) {
      return res.status(400).json({
        message:
          "Inquiry number, full name, email, subject, and message are required",
      });
    }

    const existingInquiry = await CmsInquiry.findOne({
      inquiryNumber: inquiryNumber.trim(),
    });

    if (existingInquiry) {
      return res.status(400).json({
        message: "Inquiry number already exists",
      });
    }

    // Validate assigned user
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        return res.status(400).json({
          message: "Assigned user not found",
        });
      }
    }

    const inquiry = await CmsInquiry.create({
      inquiryNumber: inquiryNumber.trim(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      inquiryType: inquiryType || "General Inquiry",
      status: status || "New",
      assignedTo: assignedTo || null,
      adminNotes: adminNotes ? adminNotes.trim() : "",
      resolvedAt:
        status === "Resolved" || status === "Closed" ? new Date() : null,
    });

    const populatedInquiry = await CmsInquiry.findById(inquiry._id).populate(
      "assignedTo",
      "name email role",
    );

    // Notify all administrators about the new website inquiry
    const adminUsers = await User.find({
      role: "admin",
    }).select("_id");

    if (adminUsers.length > 0) {
      await Notification.insertMany(
        adminUsers.map((admin) => ({
          recipient: admin._id,
          title: "New Website Inquiry",
          message: `${inquiry.fullName} submitted a new ${inquiry.inquiryType.toLowerCase()} inquiry: ${inquiry.subject}`,
          type: "Other",
          priority: "High",
          relatedId: inquiry._id,
          relatedModel: "CmsInquiry",
          isRead: false,
        })),
      );
    }

    res.status(201).json(populatedInquiry);
  } catch (error) {
    console.error("Create CMS inquiry error:", error);

    res.status(500).json({
      message: "Failed to create inquiry",
    });
  }
};

// PUT /api/cms-inquiries/:id
const updateCmsInquiry = async (req, res) => {
  try {
    const inquiry = await CmsInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }

    const {
      inquiryNumber,
      fullName,
      email,
      phone,
      subject,
      message,
      inquiryType,
      status,
      assignedTo,
      adminNotes,
    } = req.body;

    if (!inquiryNumber || !fullName || !email || !subject || !message) {
      return res.status(400).json({
        message:
          "Inquiry number, full name, email, subject, and message are required",
      });
    }

    const duplicateInquiry = await CmsInquiry.findOne({
      inquiryNumber: inquiryNumber.trim(),
      _id: { $ne: inquiry._id },
    });

    if (duplicateInquiry) {
      return res.status(400).json({
        message: "Inquiry number already exists",
      });
    }

    // Validate assigned user
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        return res.status(400).json({
          message: "Assigned user not found",
        });
      }
    }

    // Store previous assignment before changing it
    const previousAssignedTo = inquiry.assignedTo
      ? inquiry.assignedTo.toString()
      : null;

    const newAssignedTo = assignedTo || null;

    const previousStatus = inquiry.status;
    const newStatus = status || "New";

    inquiry.inquiryNumber = inquiryNumber.trim();
    inquiry.fullName = fullName.trim();
    inquiry.email = email.trim().toLowerCase();
    inquiry.phone = phone ? phone.trim() : "";
    inquiry.subject = subject.trim();
    inquiry.message = message.trim();
    inquiry.inquiryType = inquiryType || "General Inquiry";
    inquiry.status = status || "New";
    inquiry.assignedTo = newAssignedTo;
    inquiry.adminNotes = adminNotes ? adminNotes.trim() : "";

    if ((status === "Resolved" || status === "Closed") && !inquiry.resolvedAt) {
      inquiry.resolvedAt = new Date();
    }

    if (status !== "Resolved" && status !== "Closed") {
      inquiry.resolvedAt = null;
    }

    await inquiry.save();

    // Notify the newly assigned user
    if (newAssignedTo && newAssignedTo !== previousAssignedTo) {
      await Notification.create({
        recipient: newAssignedTo,
        title: "Inquiry Assigned",
        message: `A new website inquiry has been assigned to you: ${inquiry.subject}`,
        type: "Other",
        priority: "High",
        relatedId: inquiry._id,
        relatedModel: "CmsInquiry",
        isRead: false,
      });
    }

    if (
  newAssignedTo &&
  newStatus !== previousStatus
) {
  await Notification.create({
    recipient: newAssignedTo,
    title: "Inquiry Status Updated",
    message: `The inquiry "${inquiry.subject}" status has been changed from ${previousStatus} to ${newStatus}.`,
    type: "Other",
    priority: "Normal",
    relatedId: inquiry._id,
    relatedModel: "CmsInquiry",
    isRead: false,
  });
}

    const updatedInquiry = await CmsInquiry.findById(inquiry._id).populate(
      "assignedTo",
      "name email role",
    );

    res.json(updatedInquiry);
  } catch (error) {
    console.error("Update CMS inquiry error:", error);

    res.status(500).json({
      message: "Failed to update inquiry",
    });
  }
};

// DELETE /api/cms-inquiries/:id
const deleteCmsInquiry = async (req, res) => {
  try {
    const inquiry = await CmsInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        message: "Inquiry not found",
      });
    }

    await CmsInquiry.findByIdAndDelete(req.params.id);

    res.json({
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete CMS inquiry error:", error);

    res.status(500).json({
      message: "Failed to delete inquiry",
    });
  }
};

module.exports = {
  getCmsInquiries,
  getCmsInquiryById,
  createCmsInquiry,
  updateCmsInquiry,
  deleteCmsInquiry,
};
