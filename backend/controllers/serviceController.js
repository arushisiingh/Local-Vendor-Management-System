const Service = require("../models/Service");
const Vendor = require("../models/Vendor");

async function getServices(req, res, next) {
  try {
    const query = { $or: [{ availability: true }, { isAvailable: true }] };
    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, "i") },
        { description: new RegExp(req.query.search, "i") },
        { category: new RegExp(req.query.search, "i") }
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    const services = await Service.find(query)
      .populate({ path: "vendor", select: "businessName serviceCategory location serviceArea", strictPopulate: false })
      .populate({ path: "vendorId", select: "businessName serviceCategory location serviceArea", strictPopulate: false })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

async function getServiceById(req, res, next) {
  try {
    const service = await Service.findById(req.params.id).populate(
      "vendor",
      "businessName ownerName serviceCategory location serviceArea businessAddress phone"
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

async function getVendors(req, res, next) {
  try {
    const vendors = await Vendor.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
}

module.exports = { getServices, getServiceById, getVendors };
