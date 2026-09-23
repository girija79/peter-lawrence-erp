const express = require("express");

const {
  getCmsServices,
  getCmsServiceById,
  createCmsService,
  updateCmsService,
  deleteCmsService,
} = require("../controllers/cmsServiceController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", protect, authorize("admin"), getCmsServices);

router.get("/:id", protect, authorize("admin"), getCmsServiceById);

router.post("/", protect, authorize("admin"), createCmsService);

router.put("/:id", protect, authorize("admin"), updateCmsService);

router.delete("/:id", protect, authorize("admin"), deleteCmsService);

module.exports = router;