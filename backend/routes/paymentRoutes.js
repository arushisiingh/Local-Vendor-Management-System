const express = require("express");
const {
  getCheckoutConfig,
  createPaymentOrder,
  verifyPayment
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/config", getCheckoutConfig);
router.post("/orders", createPaymentOrder);
router.post("/verify", verifyPayment);

module.exports = router;
