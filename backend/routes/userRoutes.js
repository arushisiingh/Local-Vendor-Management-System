const express = require("express");
const { getProfile, updateProfile, createBooking, getMyBookings } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("user"));
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/bookings", getMyBookings);
router.post("/bookings", createBooking);

module.exports = router;
