const express = require("express");

const {
  getCommonViolations,
  getDashboardSummary,
  getOldUnpaidFines,
  getRepeatOffenders,
  getRevenue,
  getTopOfficers,
  getTopVehicles,
  getUnpaidPerOwner,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/repeat-offenders", getRepeatOffenders);
router.get("/unpaid-per-owner", getUnpaidPerOwner);
router.get("/common-violations", getCommonViolations);
router.get("/top-vehicles", getTopVehicles);
router.get("/top-officers", getTopOfficers);
router.get("/revenue", getRevenue);
router.get("/old-unpaid", getOldUnpaidFines);

module.exports = router;
