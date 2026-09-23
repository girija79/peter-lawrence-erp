const express = require("express");

const {
  getCmsInquiries,
  getCmsInquiryById,
  createCmsInquiry,
  updateCmsInquiry,
  deleteCmsInquiry,
} = require("../controllers/cmsInquiryController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", protect, authorize("admin"), getCmsInquiries);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getCmsInquiryById
);

router.post(
  "/",
  protect,
  authorize("admin"),
  createCmsInquiry
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCmsInquiry
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCmsInquiry
);

module.exports = router;