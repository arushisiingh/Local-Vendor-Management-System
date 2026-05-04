const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    frontendOrderId: { type: String, required: true, unique: true, trim: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true }
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", trim: true },
    method: { type: String, enum: ["UPI", "Card"], required: true },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded", "partially_refunded"],
      default: "created"
    },
    razorpayOrderId: { type: String, required: true, unique: true, trim: true },
    razorpayPaymentId: { type: String, default: "", trim: true },
    razorpaySignature: { type: String, default: "", trim: true },
    refundId: { type: String, default: "", trim: true },
    refundAmount: { type: Number, default: 0, min: 0 },
    notes: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
