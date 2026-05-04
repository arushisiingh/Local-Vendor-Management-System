const User = require("../models/User");
const Booking = require("../models/Booking");
const Service = require("../models/Service");

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const { serviceId, bookingDate, timeSlot, notes } = req.body;
    if (!serviceId || !bookingDate || !timeSlot) {
      res.status(400);
      throw new Error("Please provide service, booking date, and time slot");
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }

    const booking = await Booking.create({
      user: req.user._id,
      vendor: service.vendor,
      service: service._id,
      bookingDate,
      timeSlot,
      notes
    });

    const populated = await Booking.findById(booking._id)
      .populate("vendor", "businessName serviceCategory location")
      .populate("service", "title category price image");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("vendor", "businessName serviceCategory location")
      .populate("service", "title category price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile, createBooking, getMyBookings };
