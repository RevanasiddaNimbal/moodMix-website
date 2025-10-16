const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authorization");
const otpMiddleware = require("../middlewares/otpService");
const {
  register,
  varifyUser,
  resendOtp,
  login,
  resetpassword,
  forgetpassword,
  logout,
  verify,
  showUsers,
} = require("../controller/auth");
// const { verify } = require("jsonwebtoken");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgetpassword);
router.post("/verify-otp", authMiddleware, varifyUser);
router.post("/resend-otp", authMiddleware, otpMiddleware, resendOtp);
router.post("/reset-password", authMiddleware, resetpassword);
router.post("/logout", authMiddleware, logout);
router.get("/verify", authMiddleware, verify);
router.get("/users", showUsers);

module.exports = router;
