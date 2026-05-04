const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    businessAddress: { type: String, required: true, trim: true },
    serviceCategory: { type: String, required: true, trim: true },
    gstNumber: { type: String, default: "" },
    serviceArea: { type: String, default: "" },
    location: { type: String, default: "" },
    role: { type: String, default: "vendor", enum: ["vendor"] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
