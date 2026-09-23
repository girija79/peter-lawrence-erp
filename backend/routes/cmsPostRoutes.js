const express = require("express");

const {
  getCmsPosts,
  getCmsPostById,
  createCmsPost,
  updateCmsPost,
  deleteCmsPost,
} = require("../controllers/cmsPostController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", protect, authorize("admin"), getCmsPosts);

router.get("/:id", protect, authorize("admin"), getCmsPostById);

router.post("/", protect, authorize("admin"), createCmsPost);

router.put("/:id", protect, authorize("admin"), updateCmsPost);

router.delete("/:id", protect, authorize("admin"), deleteCmsPost);

module.exports = router;