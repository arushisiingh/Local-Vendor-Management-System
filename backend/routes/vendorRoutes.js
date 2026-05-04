const express = require("express");
const {
  getProfile,
  updateProfile,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getVendorBookings,
  updateBookingStatus
} = require("../controllers/vendorController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("vendor"));
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/services", getMyServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);
router.get("/bookings", getVendorBookings);
router.put("/bookings/:id/status", updateBookingStatus);

module.exports = router;
