import axios from "../../api/axios";
import styles from "./VerifyOtp.module.css";

export default function ResendOtp({ timer, email, setTimer, setIsCounting }) {
  const handleResendOpt = async () => {
    try {
      if (timer == 0) {
        const res = await axios.post("/auth/resend-otp", { email: email });

        if (res.data?.success) {
          alert(res.data.message || "OTP resent successfully!");
          setTimer(60);
          setIsCounting(true);
        } else {
          alert(res.data?.message || "Failed to resend OTP.");
        }
      } else {
        alert(`Resend OTP available in ${timer}s`);
      }
    } catch (err) {
      console.error("Resend OTP error:", err.response || err.message);
      alert(
        err.response?.data?.message ||
          "Error resending OTP. Please try again later."
      );
    }
  };
  return (
    <div>
      <button onClick={handleResendOpt} className={styles.resendBtn}>
        Resend Now
      </button>
    </div>
  );
}
