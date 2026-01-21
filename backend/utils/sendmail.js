const nodemailer = require("nodemailer");

const sendotp = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_EMAIL,   // verified sender email
        pass: process.env.BREVO_SMTP_KEY // SMTP key
      }
    });

    console.log("Sending OTP to:", email);

    const mailOptions = {
      from: `MoodMix <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      text: `You have successfully registered to MoodMix.

Your OTP code is: ${otp}
Valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Email error:", err);
    return { error: true };
  }
};

module.exports = sendotp;
