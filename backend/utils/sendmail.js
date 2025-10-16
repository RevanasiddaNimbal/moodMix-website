const nodemailer = require("nodemailer");

const sendotp = async (email, otp) => {
  try {
    const transfort = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailoption = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your OTP code",
      text: `You have successfully registered to my website, your otp code :${otp} please enter within 10 minutes`,
    };
    const info = await transfort.sendMail(mailoption);
    if (!info) {
      return {
        error: true,
      };
    }

    return true;
  } catch (err) {
    // console.error(err.stack);
    return {
      error: true,
    };
  }
};

module.exports = sendotp;
