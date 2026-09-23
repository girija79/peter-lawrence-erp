const CmsPost = require("../models/CmsPost");

// @desc    Get all CMS posts
// @route   GET /api/cms-posts
const getCmsPosts = async (req, res) => {
  try {
    const posts = await CmsPost.find()
      .populate("author", "name email role")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ publicationDate: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CMS posts",
      error: error.message,
    });
  }
};

// @desc    Get single CMS post
// @route   GET /api/cms-posts/:id
const getCmsPostById = async (req, res) => {
  try {
    const post = await CmsPost.findById(req.params.id)
      .populate("author", "name email role")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!post) {
      return res.status(404).json({
        message: "CMS post not found",
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch CMS post",
      error: error.message,
    });
  }
};

// @desc    Create CMS post
// @route   POST /api/cms-posts
const createCmsPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      featuredImage,
      author,
      publicationDate,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title || !slug || !excerpt || !content || !author) {
      return res.status(400).json({
        message:
          "Title, slug, excerpt, content and author are required",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    const existingPost = await CmsPost.findOne({
      slug: normalizedSlug,
    });

    if (existingPost) {
      return res.status(400).json({
        message: "A CMS post with this slug already exists",
      });
    }

    const post = await CmsPost.create({
      title,
      slug: normalizedSlug,
      category: category || "Legal News",
      excerpt,
      content,
      featuredImage: featuredImage || "",
      author,
      publicationDate: publicationDate || null,
      status: status || "Draft",
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      createdBy: req.user._id,
    });

    const populatedPost = await CmsPost.findById(post._id)
      .populate("author", "name email role")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create CMS post",
      error: error.message,
    });
  }
};

// @desc    Update CMS post
// @route   PUT /api/cms-posts/:id
const updateCmsPost = async (req, res) => {
  try {
    const post = await CmsPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "CMS post not found",
      });
    }

    const {
      title,
      slug,
      category,
      excerpt,
      content,
      featuredImage,
      author,
      publicationDate,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!title || !slug || !excerpt || !content || !author) {
      return res.status(400).json({
        message:
          "Title, slug, excerpt, content and author are required",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    const duplicatePost = await CmsPost.findOne({
      slug: normalizedSlug,
      _id: { $ne: post._id },
    });

    if (duplicatePost) {
      return res.status(400).json({
        message: "A CMS post with this slug already exists",
      });
    }

    post.title = title;
    post.slug = normalizedSlug;
    post.category = category || "Legal News";
    post.excerpt = excerpt;
    post.content = content;
    post.featuredImage = featuredImage || "";
    post.author = author;
    post.publicationDate = publicationDate || null;
    post.status = status || "Draft";
    post.metaTitle = metaTitle || "";
    post.metaDescription = metaDescription || "";
    post.updatedBy = req.user._id;

    await post.save();

    const updatedPost = await CmsPost.findById(post._id)
      .populate("author", "name email role")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update CMS post",
      error: error.message,
    });
  }
};

// @desc    Delete CMS post
// @route   DELETE /api/cms-posts/:id
const deleteCmsPost = async (req, res) => {
  try {
    const post = await CmsPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "CMS post not found",
      });
    }

    await post.deleteOne();

    res.json({
      message: "CMS post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete CMS post",
      error: error.message,
    });
  }
};

module.exports = {
  getCmsPosts,
  getCmsPostById,
  createCmsPost,
  updateCmsPost,
  deleteCmsPost,
};