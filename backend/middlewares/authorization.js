const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.header("x-verify-token") ||
      req.cookies?.token ||
      req.cookies?.verifytoken;

    if (!token) {
      return res.status(401).json({
        error: "No token provided.",
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.email = decode.email;

    next();
  } catch (err) {
    console.error("Token Error :", err.message);
    return res.status(401).json({
      error: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
