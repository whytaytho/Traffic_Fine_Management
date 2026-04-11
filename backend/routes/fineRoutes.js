const express = require("express");

const {
  cancelFine,
  createFine,
  deleteFine,
  disputeFine,
  getFineById,
  getFines,
  payFine,
  resolveDispute,
  updateFine,
} = require("../controllers/fineController");

const router = express.Router();

router.route("/").get(getFines).post(createFine);
router.route("/:id").get(getFineById).put(updateFine).delete(deleteFine);
router.post("/:id/pay", payFine);
router.post("/:id/dispute", disputeFine);
router.post("/:id/cancel", cancelFine);
router.post("/:id/resolve-dispute", resolveDispute);

module.exports = router;
