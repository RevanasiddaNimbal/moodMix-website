const nodemailer = require("nodemailer");

const sendotp = async (email, otp) => {
  try {
    const transfort = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,      
      secure: false, 
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
        connectionTimeout: 10000,
    });
    console.log("Sending OTP to:", email);

    let mailoption = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your OTP code",
      text: `You have successfully registered to moodmix website, your otp code :${otp} please enter within 10 minutes`,
    };
    const info = await transfort.sendMail(mailoption);
    console.log("Email sent:", info);
    if (!info) {
      console.log("Failed to send OTP to:", email);
      return {
        error: true,
      };
    }

    return true;
  } catch (err) {
    console.error(err);
    return {
      error: true,
    };
  }
};

module.exports = sendotp;
