const sendotp = require("../utils/sendmail");
const User = require("../model/authmodel");

const otpMiddleware = async (req, res, next) => {
  try {
    const email = req.body?.email || req.email || req.user?.email;
    if (!email) {
      return res.status(401).json({
        success: false,
        error: "Email is required.",
      });
    }

    const user = await User.checkUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expire_at = new Date(Date.now() + 5 * 60 * 1000);

    const update = await User.updateOtp({ email, otp, otp_expire_at });
    if (update.error) {
      return res.status(500).json({
        error: "Failed to generate OTP. Please try again.",
      });
    }
    const sendemail = await sendotp(email, otp);
    if (sendemail.error) {
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP email.",
      });
    }

    req.otp = otp;
    req.otp_expire_at = otp_expire_at;
    req.user = update;

    next();
  } catch (err) {
    console.error(err.stack);
    next(err);
  }
};

module.exports = otpMiddleware;
