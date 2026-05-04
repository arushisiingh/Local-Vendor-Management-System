const express = require("express");
const { registerUser, registerVendor, login } = require("../controllers/authController");

const router = express.Router();

router.post("/register-user", registerUser);
router.post("/register-vendor", registerVendor);
router.post("/login", login);

module.exports = router;
