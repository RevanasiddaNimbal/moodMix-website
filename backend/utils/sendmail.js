const axios = require("axios");

const sendotp = async (email, otp) => {
  try {
    console.log("Sending OTP to:", email);

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "MoodMix",
          email: process.env.BREVO_EMAIL,
        },
        to: [{ email }],
        subject: "Your OTP code",
        textContent: `You have successfully registered to MoodMix.

Your OTP code is: ${otp}
Valid for 10 minutes.`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_SMTP_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    console.log("OTP email sent successfully");
    return true;
  } catch (err) {
    console.error("Brevo HTTPS error:", err.response?.data || err.message);
    return { error: true };
  }
};

module.exports = sendotp;
