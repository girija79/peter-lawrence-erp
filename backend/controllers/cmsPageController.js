const CmsPage = require("../models/CmsPage");

// @desc    Get all CMS pages
// @route   GET /api/cms-pages
const getCmsPages = async (req, res) => {
  try {
    const pages = await CmsPage.find()
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(pages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CMS pages",
      error: error.message,
    });
  }
};

// @desc    Get single CMS page
// @route   GET /api/cms-pages/:id
const getCmsPageById = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!page) {
      return res.status(404).json({
        message: "CMS page not found",
      });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CMS page",
      error: error.message,
    });
  }
};

// @desc    Create CMS page
// @route   POST /api/cms-pages
const createCmsPage = async (req, res) => {
  try {
    const {
      pageTitle,
      slug,
      pageType,
      content,
      metaTitle,
      metaDescription,
      status,
      publishedAt,
    } = req.body;

    if (!pageTitle || !slug || !content) {
      return res.status(400).json({
        message: "Page title, slug and content are required",
      });
    }

    const existingPage = await CmsPage.findOne({
      slug: slug.toLowerCase().trim(),
    });

    if (existingPage) {
      return res.status(400).json({
        message: "A CMS page with this slug already exists",
      });
    }

    const page = await CmsPage.create({
      pageTitle,
      slug: slug.toLowerCase().trim(),
      pageType,
      content,
      metaTitle,
      metaDescription,
      status,
      publishedAt:
        status === "Published"
          ? publishedAt || new Date()
          : null,
      createdBy: req.user._id,
    });

    const populatedPage = await CmsPage.findById(page._id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.status(201).json(populatedPage);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create CMS page",
      error: error.message,
    });
  }
};

// @desc    Update CMS page
// @route   PUT /api/cms-pages/:id
const updateCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        message: "CMS page not found",
      });
    }

    const {
      pageTitle,
      slug,
      pageType,
      content,
      metaTitle,
      metaDescription,
      status,
      publishedAt,
    } = req.body;

    if (!pageTitle || !slug || !content) {
      return res.status(400).json({
        message: "Page title, slug and content are required",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    const duplicatePage = await CmsPage.findOne({
      slug: normalizedSlug,
      _id: { $ne: page._id },
    });

    if (duplicatePage) {
      return res.status(400).json({
        message: "A CMS page with this slug already exists",
      });
    }

    page.pageTitle = pageTitle;
    page.slug = normalizedSlug;
    page.pageType = pageType;
    page.content = content;
    page.metaTitle = metaTitle || "";
    page.metaDescription = metaDescription || "";
    page.status = status || "Draft";
    page.updatedBy = req.user._id;

    if (page.status === "Published") {
      page.publishedAt = publishedAt || page.publishedAt || new Date();
    } else {
      page.publishedAt = null;
    }

    await page.save();

    const updatedPage = await CmsPage.findById(page._id)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.json(updatedPage);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update CMS page",
      error: error.message,
    });
  }
};

// @desc    Delete CMS page
// @route   DELETE /api/cms-pages/:id
const deleteCmsPage = async (req, res) => {
  try {
    const page = await CmsPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        message: "CMS page not found",
      });
    }

    await page.deleteOne();

    res.json({
      message: "CMS page deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete CMS page",
      error: error.message,
    });
  }
};

module.exports = {
  getCmsPages,
  getCmsPageById,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
};