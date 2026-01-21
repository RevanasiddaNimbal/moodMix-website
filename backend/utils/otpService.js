const sendotp = require("./sendmail");
const User = require("../model/authmodel");
const jwt = require("jsonwebtoken");

const SendOtp = async ({ email }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.checkUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp_expire_at = new Date(Date.now() + 5 * 60 * 1000);

  const update = await User.updateOtp({ email, otp, otp_expire_at });
  if (update?.error) {
    throw new Error("Failed to generate OTP");
  }

  await sendotp(email, otp);

  return;
};

module.exports = { SendOtp };
