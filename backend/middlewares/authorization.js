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
    console.error("Token Error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
      });
    }
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};

module.exports = authMiddleware;
