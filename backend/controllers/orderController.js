const Order = require("../models/Order");
const Payment = require("../models/Payment");
const getRazorpayInstance = require("../config/razorpay");
const { calculateCancellationBreakdown } = require("../utils/cancellation");

async function cancelOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (["Cancelled", "Rejected", "Delivered"].includes(order.status)) {
      res.status(400);
      throw new Error(`Order cannot be cancelled from status "${order.status}"`);
    }

    const customerEmail = String(req.body.customerEmail || "").trim().toLowerCase();
    if (!customerEmail || customerEmail !== String(order.customer.email || "").toLowerCase()) {
      res.status(403);
      throw new Error("Only the customer who placed this order can cancel it");
    }

    const breakdown = calculateCancellationBreakdown(order);
    let refund = null;

    if (order.razorpayPaymentId && breakdown.refundAmount > 0) {
      const razorpay = getRazorpayInstance();
      refund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(breakdown.refundAmount * 100),
        speed: "optimum",
        receipt: `refund_${order.frontendOrderId}`.slice(0, 40),
        notes: {
          frontendOrderId: order.frontendOrderId,
          reason: breakdown.reason
        }
      });
    }

    order.status = "Cancelled";
    order.paymentStatus = breakdown.refundAmount > 0 ? "Partially Refunded" : "Refunded";
    order.cancellation = {
      feePercent: breakdown.feePercent,
      feeAmount: breakdown.feeAmount,
      refundAmount: breakdown.refundAmount,
      reason: breakdown.reason,
      refundId: refund?.id || "",
      refundStatus: refund?.status || (breakdown.refundAmount > 0 ? "processed" : "not_applicable"),
      cancelledAt: new Date()
    };
    await order.save();

    if (order.paymentRecord) {
      await Payment.findByIdAndUpdate(order.paymentRecord, {
        status: breakdown.refundAmount === order.total ? "refunded" : "partially_refunded",
        refundId: refund?.id || "",
        refundAmount: breakdown.refundAmount
      });
    }

    res.json({
      success: true,
      data: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        cancellation: order.cancellation
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { cancelOrder };
