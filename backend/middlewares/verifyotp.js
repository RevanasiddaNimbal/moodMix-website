const jwt = require("jsonwebtoken");

const verifyOtpMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.verifytoken || req.header("x-verify-token");
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.email = decoded.email;
      req.id = decoded.id;
    } else {
      const email = req.body?.email;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required for OTP verification",
        });
      }
      req.email = email;
      req.id = null;
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Verification token expired or invalid",
    });
  }
};

module.exports = verifyOtpMiddleware;
