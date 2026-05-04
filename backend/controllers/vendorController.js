const Vendor = require("../models/Vendor");
const Service = require("../models/Service");
const Booking = require("../models/Booking");

async function getProfile(req, res, next) {
  try {
    const vendor = await Vendor.findById(req.user._id).select("-password");
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.user._id,
      {
        businessName: req.body.businessName,
        ownerName: req.body.ownerName,
        email: req.body.email,
        phone: req.body.phone,
        businessAddress: req.body.businessAddress,
        serviceCategory: req.body.serviceCategory,
        gstNumber: req.body.gstNumber,
        serviceArea: req.body.serviceArea,
        location: req.body.location
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
}

async function createService(req, res, next) {
  try {
    const { title, description, category, price, image, availability } = req.body;
    if (!title || !description || !category || price === undefined) {
      res.status(400);
      throw new Error("Please provide all required service fields");
    }

    const service = await Service.create({
      vendor: req.user._id,
      title,
      description,
      category,
      price,
      image,
      availability
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

async function deleteService(req, res, next) {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }

    res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    next(error);
  }
}

async function getMyServices(req, res, next) {
  try {
    const services = await Service.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

async function getVendorBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ vendor: req.user._id })
      .populate("user", "fullName email phone")
      .populate("service", "title category price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user._id },
      { status: req.body.status },
      { new: true, runValidators: true }
    )
      .populate("user", "fullName email phone")
      .populate("service", "title category price image");

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  createService,
  updateService,
  deleteService,
  getMyServices,
  getVendorBookings,
  updateBookingStatus
};
