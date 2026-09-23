const express = require("express");

const {
  getCmsPages,
  getCmsPageById,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
} = require("../controllers/cmsPageController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

const router = express.Router();

// CMS management — Admin only
router.get("/", protect, authorize("admin"), getCmsPages);

router.get("/:id", protect, authorize("admin"), getCmsPageById);

router.post("/", protect, authorize("admin"), createCmsPage);

router.put("/:id", protect, authorize("admin"), updateCmsPage);

router.delete("/:id", protect, authorize("admin"), deleteCmsPage);

module.exports = router;