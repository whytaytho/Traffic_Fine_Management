const express = require("express");

const {
  createOfficer,
  deleteOfficer,
  getOfficerById,
  getOfficers,
  updateOfficer,
} = require("../controllers/officerController");

const router = express.Router();

router.route("/").get(getOfficers).post(createOfficer);
router.route("/:id").get(getOfficerById).put(updateOfficer).delete(deleteOfficer);

module.exports = router;
