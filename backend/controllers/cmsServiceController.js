const User = require("../models/User");
const Notification = require("../models/Notification");

const CmsService = require("../models/CmsService");

// @desc    Get all CMS services
// @route   GET /api/cms-services
const getCmsServices = async (req, res) => {
  try {
    const services = await CmsService.find()
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CMS services",
      error: error.message,
    });
  }
};

// @desc    Get single CMS service
// @route   GET /api/cms-services/:id
const getCmsServiceById = async (req, res) => {
  try {
    const service = await CmsService.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!service) {
      return res.status(404).json({
        message: "CMS service not found",
      });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CMS service",
      error: error.message,
    });
  }
};

// @desc    Create CMS service
// @route   POST /api/cms-services
const createCmsService = async (req, res) => {
  try {
    const {
      serviceTitle,
      slug,
      shortDescription,
      description,
      icon,
      displayOrder,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!serviceTitle || !slug || !shortDescription || !description) {
      return res.status(400).json({
        message:
          "Service title, slug, short description and description are required",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    const existingService = await CmsService.findOne({
      slug: normalizedSlug,
    });

    if (existingService) {
      return res.status(400).json({
        message: "A CMS service with this slug already exists",
      });
    }

    const service = await CmsService.create({
      serviceTitle,
      slug: normalizedSlug,
      shortDescription,
      description,
      icon: icon || "",
      displayOrder:
        displayOrder !== undefined && displayOrder !== ""
          ? Number(displayOrder)
          : 0,
      status: status || "Draft",
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      createdBy: req.user._id,
    });

    const populatedService = await CmsService.findById(service._id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.status(201).json(populatedService);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create CMS service",
      error: error.message,
    });
  }
};

// @desc    Update CMS service
// @route   PUT /api/cms-services/:id
const updateCmsService = async (req, res) => {
  try {
    const service = await CmsService.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "CMS service not found",
      });
    }

    const {
      serviceTitle,
      slug,
      shortDescription,
      description,
      icon,
      displayOrder,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!serviceTitle || !slug || !shortDescription || !description) {
      return res.status(400).json({
        message:
          "Service title, slug, short description and description are required",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    const duplicateService = await CmsService.findOne({
      slug: normalizedSlug,
      _id: { $ne: service._id },
    });

    if (duplicateService) {
      return res.status(400).json({
        message: "A CMS service with this slug already exists",
      });
    }

    service.serviceTitle = serviceTitle;
    service.slug = normalizedSlug;
    service.shortDescription = shortDescription;
    service.description = description;
    service.icon = icon || "";

    service.displayOrder =
      displayOrder !== undefined && displayOrder !== ""
        ? Number(displayOrder)
        : 0;

    service.status = status || "Draft";
    service.metaTitle = metaTitle || "";
    service.metaDescription = metaDescription || "";
    service.updatedBy = req.user._id;

    await service.save();

    const updatedService = await CmsService.findById(service._id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update CMS service",
      error: error.message,
    });
  }
};

// @desc    Delete CMS service
// @route   DELETE /api/cms-services/:id
const deleteCmsService = async (req, res) => {
  try {
    const service = await CmsService.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "CMS service not found",
      });
    }

    await service.deleteOne();

    res.json({
      message: "CMS service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete CMS service",
      error: error.message,
    });
  }
};

module.exports = {
  getCmsServices,
  getCmsServiceById,
  createCmsService,
  updateCmsService,
  deleteCmsService,
};