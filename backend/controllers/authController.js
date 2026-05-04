const bcrypt = require("bcrypt");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const generateToken = require("../utils/generateToken");

async function registerUser(req, res, next) {
  try {
    const { fullName, email, phone, password, address } = req.body;
    if (!fullName || !email || !phone || !password) {
      res.status(400);
      throw new Error("Please provide all required user fields");
    }

    const existing = (await User.findOne({ email })) || (await Vendor.findOne({ email }));
    if (existing) {
      res.status(400);
      throw new Error("Email already in use");
    }

    const existingPhone = (await User.findOne({ phone })) || (await Vendor.findOne({ phone }));
    if (existingPhone) {
      res.status(400);
      throw new Error("Phone already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      address
    });

    res.status(201).json({
      success: true,
      token: generateToken({ id: user._id, role: "user" }),
      data: { role: "user", account: user }
    });
  } catch (error) {
    next(error);
  }
}

async function registerVendor(req, res, next) {
  try {
    const { businessName, ownerName, email, phone, password, businessAddress, serviceCategory, gstNumber, serviceArea, location } = req.body;
    if (!businessName || !ownerName || !email || !phone || !password || !businessAddress || !serviceCategory) {
      res.status(400);
      throw new Error("Please provide all required vendor fields");
    }

    const existing = (await User.findOne({ email })) || (await Vendor.findOne({ email }));
    if (existing) {
      res.status(400);
      throw new Error("Email already in use");
    }

    const existingPhone = (await User.findOne({ phone })) || (await Vendor.findOne({ phone }));
    if (existingPhone) {
      res.status(400);
      throw new Error("Phone already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const vendor = await Vendor.create({
      businessName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      businessAddress,
      serviceCategory,
      gstNumber,
      serviceArea,
      location
    });

    res.status(201).json({
      success: true,
      token: generateToken({ id: vendor._id, role: "vendor" }),
      data: { role: "vendor", account: vendor }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    let account = await User.findOne({ email });
    let role = "user";
    if (!account) {
      account = await Vendor.findOne({ email });
      role = "vendor";
    }

    if (!account) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    res.json({
      success: true,
      token: generateToken({ id: account._id, role }),
      data: { role, account }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { registerUser, registerVendor, login };
