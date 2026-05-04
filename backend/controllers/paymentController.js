const crypto = require("crypto");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const getRazorpayInstance = require("../config/razorpay");

function toSubunits(amount) {
  return Math.round(Number(amount || 0) * 100);
}

function validateCheckoutPayload(body) {
  const required = [
    "frontendOrderId",
    "customerName",
    "customerEmail",
    "customerPhone",
    "customerAddress",
    "vendorName",
    "subtotal",
    "delivery",
    "tax",
    "total",
    "paymentMethod"
  ];

  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return `Missing required field: ${field}`;
    }
  }

  if (!Array.isArray(body.items) || !body.items.length) {
    return "At least one item is required";
  }

  if (!["UPI", "Card"].includes(body.paymentMethod)) {
    return "Only UPI and Card use the online payment gateway";
  }

  return "";
}

async function getCheckoutConfig(req, res, next) {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      res.status(500);
      throw new Error("Razorpay key id is missing");
    }

    res.json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        currency: "INR"
      }
    });
  } catch (error) {
    next(error);
  }
}

async function createPaymentOrder(req, res, next) {
  try {
    const validationMessage = validateCheckoutPayload(req.body);
    if (validationMessage) {
      res.status(400);
      throw new Error(validationMessage);
    }

    const razorpay = getRazorpayInstance();
    const amount = Number(req.body.total);
    const receipt = String(req.body.frontendOrderId).slice(0, 40);

    const razorpayOrder = await razorpay.orders.create({
      amount: toSubunits(amount),
      currency: "INR",
      receipt,
      notes: {
        frontendOrderId: req.body.frontendOrderId,
        customerEmail: req.body.customerEmail,
        vendorName: req.body.vendorName
      }
    });

    const payment = await Payment.findOneAndUpdate(
      { frontendOrderId: req.body.frontendOrderId },
      {
        frontendOrderId: req.body.frontendOrderId,
        customer: {
          name: req.body.customerName,
          email: req.body.customerEmail,
          phone: req.body.customerPhone
        },
        amount,
        currency: "INR",
        method: req.body.paymentMethod,
        status: "created",
        razorpayOrderId: razorpayOrder.id,
        notes: {
          vendorName: req.body.vendorName,
          vendorEmail: req.body.vendorEmail || "",
          itemCount: req.body.items.length
        }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const order = await Order.findOneAndUpdate(
      { frontendOrderId: req.body.frontendOrderId },
      {
        frontendOrderId: req.body.frontendOrderId,
        customer: {
          name: req.body.customerName,
          email: req.body.customerEmail,
          phone: req.body.customerPhone,
          address: req.body.customerAddress
        },
        vendor: {
          name: req.body.vendorName,
          email: req.body.vendorEmail || ""
        },
        items: req.body.items.map(item => ({
          productId: item.productId || item.id || "",
          name: item.name,
          price: Number(item.price),
          qty: Number(item.qty),
          image: item.image || ""
        })),
        subtotal: Number(req.body.subtotal),
        delivery: Number(req.body.delivery),
        tax: Number(req.body.tax),
        total: amount,
        status: "Pending Payment",
        paymentMethod: req.body.paymentMethod,
        paymentStatus: "Created",
        razorpayOrderId: razorpayOrder.id,
        paymentRecord: payment._id,
        deliveryDetails: {
          name: req.body.customerName,
          phone: req.body.customerPhone,
          address: req.body.customerAddress,
          landmark: req.body.landmark || "",
          slot: req.body.slot || "",
          date: req.body.date || "",
          time: req.body.time || "",
          specialRequest: req.body.specialRequest || ""
        }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentRecordId: payment._id,
        orderRecordId: order._id,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { paymentRecordId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!paymentRecordId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error("Payment verification payload is incomplete");
    }

    const payment = await Payment.findById(paymentRecordId);
    if (!payment) {
      res.status(404);
      throw new Error("Payment record not found");
    }

    if (payment.razorpayOrderId !== razorpay_order_id) {
      res.status(400);
      throw new Error("Payment order mismatch");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();
      res.status(400);
      throw new Error("Payment signature verification failed");
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    const order = await Order.findOneAndUpdate(
      { frontendOrderId: payment.frontendOrderId },
      {
        status: "Pending",
        paymentStatus: "Paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentRecord: payment._id
      },
      { new: true }
    );

    if (!order) {
      res.status(404);
      throw new Error("Order record not found");
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        frontendOrderId: order.frontendOrderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        transaction: {
          id: razorpay_payment_id,
          orderId: razorpay_order_id,
          method: payment.method,
          status: "Paid",
          amount: order.total,
          date: order.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCheckoutConfig,
  createPaymentOrder,
  verifyPayment
};
