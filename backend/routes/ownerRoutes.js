const express = require("express");

const {
  createOwner,
  deleteOwner,
  getOwnerById,
  getOwners,
  updateOwner,
} = require("../controllers/ownerController");

const router = express.Router();

router.route("/").get(getOwners).post(createOwner);
router.route("/:id").get(getOwnerById).put(updateOwner).delete(deleteOwner);

module.exports = router;
