const jwt = require("jsonwebtoken");
const User = require("../model/authmodel");
const bcrypt = require("bcrypt");
const { SendOtp } = require("../utils/otpService");

exports.register = async (req, res, next) => {
  try {
    const { name, email, phonenumber, password } = req.body;
    if (!name || !email || !phonenumber || !password) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be proveded.",
      });
    }

    const user = await User.checkUserByEmail(email);
    if (user && user.error) {
      return res.status(409).json({
        success: false,
        error: user.error,
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);

    const result = await User.createUser({
      name,
      email,
      phonenumber,
      password: hashpassword,
    });
    if (result.error) {
      return res.status(500).json({
        success: false,
        error: "Failed to register user. Please try again.",
      });
    }

    const verifyToken = await jwt.sign(
      { email: email },
      process.env.SECRET_KEY,
      {
        expiresIn: "5m",
      },
    );

    res.cookie("verifytoken", verifyToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message:
        " User registered successfully. Please verify your account using the OTP sent to your email.",
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
      },
      verifyToken,
    });

    SendOtp({ email }).catch((err) =>
      console.log("sending otp error(register):", err),
    );
  } catch (err) {
    next(err);
  }
};

exports.varifyUser = async (req, res, next) => {
  try {
    const otp = req.body.otp;
    const email = req.email;

    const user = await User.getUserByEmail(email);
    if (user.error) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP. Please enter again.",
      });
    }

    if (new Date() > new Date(user.otp_expire_at)) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired.Please requrst a new one.",
      });
    }

    const updateUser = await User.verifyUser(email);
    if (updateUser.error) {
      return res.status(500).json({
        success: false,
        error: "Failed to verify user.Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account verified successfully. You may now log in",
      user: updateUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const email = req.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required to resend OTP.",
      });
    }
    const verifyToken = await jwt.sign(
      { email: email },
      process.env.SECRET_KEY,
      {
        expiresIn: "5m",
      },
    );

    res.cookie("verifytoken", verifyToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "OTP has been sent to your registered email.",
      user: req.email,
    });

    SendOtp({ email }).catch((err) =>
      console.error("OTP error (resend):", err.message),
    );
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await User.login(email, password);

    if (result?.error) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }

    if (!result.user.is_verified) {
      SendOtp({ email }).catch((err) =>
        console.error("OTP error (login):", err.message),
      );

      const verifyToken = await jwt.sign(
        { email: email },
        process.env.SECRET_KEY,
        {
          expiresIn: "5m",
        },
      );

      res.cookie("verifytoken", verifyToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 5 * 60 * 1000,
      });

      return res.status(403).json({
        success: false,
        redirect: "/verify-otp",
        message: "Account not verified. OTP sent again.",
      });
    }

    const token = jwt.sign(
      { id: result.user.id, email },
      process.env.SECRET_KEY,
      { expiresIn: "2h" },
    );

    const refreshToken = jwt.sign({ email }, process.env.REFRESH_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.cookie("refreshtoken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      email: result.user.email,
      name: result.user.name,
    });
  } catch (err) {
    next(err);
  }
};

exports.forgetpassword = async (req, res, next) => {
  try {
    const { email, newpassword, confirm, otp } = req.body;

    if (newpassword !== confirm || !email) {
      return res.status(400).json({
        success: false,
        error: "Email and password confirmation do not match.",
      });
    }
    const user = await User.getUserByEmail(email);
    if (user.error) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP. Please enter again.",
      });
    }
    const hash = await bcrypt.hash(newpassword, 10);
    const updatepass = await User.resetPassword({ newpassword: hash, email });
    if (updatepass.error) {
      return res.status(500).json({
        success: false,
        error: "Failed to reset password. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
      User_email: email,
    });
  } catch (err) {
    next(err);
  }
};

exports.resetpassword = async (req, res, next) => {
  try {
    const { oldpassword, newpassword, email } = req.body;

    const user = await User.getUserByEmail(email);
    if (user.error) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }
    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "The current password you entered is incorrect.",
      });
    }
    const hash = await bcrypt.hash(newpassword, 10);
    const resetpass = await User.resetPassword({ newpassword: hash, email });
    if (resetpass.error) {
      return res.status(500).json({
        error: "Failed to change password.please try again.",
      });
    }

    res.status(200).json({
      message: "Password updated successfully.",
      user: resetpass,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.clearCookie("refreshtoken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "logged out successfully",
    });
  } catch (err) {
    console.error(err.stack);
    next(err);
  }
};

exports.verify = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      email: req.email,
      message: "Token is valid",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshtoken = req.cookies?.refreshtoken;
    if (!refreshtoken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required.",
      });
    }

    const decode = jwt.verify(refreshtoken, process.env.REFRESH_KEY);
    if (!decode) {
      return res.status(401).json({
        success: false,
        error: "invalid or expired token.",
      });
    }
    const newToken = jwt.sign(
      {
        email: decode.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "2m",
      },
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 2 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully.",
    });
  } catch (err) {
    console.log("Refresh Error:", err.stack);
    next(err);
  }
};
