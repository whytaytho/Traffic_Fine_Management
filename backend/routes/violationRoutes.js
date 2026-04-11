const express = require("express");

const {
  createViolation,
  deleteViolation,
  getViolationById,
  getViolations,
  updateViolation,
} = require("../controllers/violationController");

const router = express.Router();

router.route("/").get(getViolations).post(createViolation);
router.route("/:id").get(getViolationById).put(updateViolation).delete(deleteViolation);

module.exports = router;
