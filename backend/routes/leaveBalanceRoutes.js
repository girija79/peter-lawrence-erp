const express = require("express");

const {
  getLeaveBalances,
  getMyLeaveBalance,
  getLeaveBalanceByEmployee,
  createLeaveBalance,
  updateLeaveBalance,
  deleteLeaveBalance,
} = require("../controllers/leaveBalanceController");

const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

const router = express.Router();

// Admin can view all balances
router.get(
  "/",
  protect,
  authorize("admin"),
  getLeaveBalances
);

// Employee can view only their own balance
router.get(
  "/me",
  protect,
  authorize("employee"),
  getMyLeaveBalance
);

// Admin can view a specific employee's balance
router.get(
  "/employee/:employeeId",
  protect,
  authorize("admin"),
  getLeaveBalanceByEmployee
);

// Admin can create a balance
router.post(
  "/",
  protect,
  authorize("admin"),
  createLeaveBalance
);

// Admin can update a balance
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateLeaveBalance
);

// Admin can delete a balance
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteLeaveBalance
);

module.exports = router;