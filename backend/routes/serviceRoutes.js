const express = require("express");
const { getServices, getServiceById, getVendors } = require("../controllers/serviceController");

const router = express.Router();

router.get("/", getServices);
router.get("/vendors", getVendors);
router.get("/:id", getServiceById);

module.exports = router;
