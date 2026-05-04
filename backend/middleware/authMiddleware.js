const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vendor = require("../models/Vendor");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";

    if (!token) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = decoded.role === "vendor" ? Vendor : User;
    const account = await Model.findById(decoded.id).select("-password");

    if (!account) {
      res.status(401);
      throw new Error("Account not found");
    }

    req.user = account;
    req.role = decoded.role;
    next();
  } catch (error) {
    next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      res.status(403);
      return next(new Error("Forbidden"));
    }
    next();
  };
}

module.exports = { protect, authorize };
