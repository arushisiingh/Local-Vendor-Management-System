const express = require("express");
const { cancelOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/:id/cancel", cancelOrder);

module.exports = router;
