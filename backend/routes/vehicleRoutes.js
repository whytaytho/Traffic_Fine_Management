const express = require("express");

const {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle,
} = require("../controllers/vehicleController");

const router = express.Router();

router.route("/").get(getVehicles).post(createVehicle);
router.route("/:id").get(getVehicleById).put(updateVehicle).delete(deleteVehicle);

module.exports = router;
