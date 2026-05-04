const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Accepted", "Out for Delivery", "Delivered", "Completed", "Rejected", "Cancelled"],
      default: "Pending"
    },
    paymentMethod: { type: String, default: "Cash on Delivery" },
    paymentStatus: { type: String, default: "Pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
