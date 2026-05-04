const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    frontendOrderId: { type: String, required: true, unique: true, trim: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true }
    },
    vendor: {
      name: { type: String, required: true, trim: true },
      email: { type: String, default: "", lowercase: true, trim: true }
    },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    delivery: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending Payment", "Pending", "Accepted", "Out for Delivery", "Delivered", "Rejected", "Cancelled"],
      default: "Pending Payment"
    },
    paymentMethod: { type: String, enum: ["UPI", "Card", "Cash on Delivery"], required: true },
    paymentStatus: {
      type: String,
      enum: ["Created", "Pending", "Paid", "Captured", "Failed", "Refund Pending", "Refunded", "Partially Refunded"],
      default: "Created"
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    paymentRecord: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
    deliveryDetails: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      landmark: { type: String, default: "" },
      slot: { type: String, default: "" },
      date: { type: String, default: "" },
      time: { type: String, default: "" },
      specialRequest: { type: String, default: "" }
    },
    cancellation: {
      feePercent: { type: Number, default: 0 },
      feeAmount: { type: Number, default: 0 },
      refundAmount: { type: Number, default: 0 },
      reason: { type: String, default: "" },
      refundId: { type: String, default: "" },
      refundStatus: { type: String, default: "" },
      cancelledAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
