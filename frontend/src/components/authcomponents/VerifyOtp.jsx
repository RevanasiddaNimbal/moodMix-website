import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useEffect, useState } from "react";
import Timer from "./Timer";
import ResendOtp from "./ResendOtp";
import styles from "./verifyOtp.module.css";

export default function VerifyOtp() {
  const location = useLocation();
  const { email } = location.state || {};
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate("/register");
    } else {
      setIsCounting(true);
      setTimer(60);
    }
  }, [email, navigate]);

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Please enter OTP.");
      return;
    }

    try {
      const res = await axios.post("/auth/verify-otp", {
        email: user.email,
        otp,
      });

      if (res.data?.success) {
        alert(res.data.message || "OTP verified successfully!");
        navigate("/login");
      } else {
        alert(res.data?.error || "Invalid OTP, please try again.");
        setOtp("");
      }
    } catch (err) {
      console.error("OTP verify error:", err.response || err.message);
      alert(
        err.response?.data?.error ||
          "Error verifying OTP. Please try again later."
      );
      setOtp("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.otpCard}>
        <h2 className={styles.title}>Verify Your OTP</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className={styles.input}
        />

        <Timer
          isCounting={isCounting}
          setIsCounting={setIsCounting}
          timer={timer}
          setTimer={setTimer}
          className={styles.timer}
        />

        <div className={styles.buttonGroup}>
          <ResendOtp
            timer={timer}
            email={email}
            setTimer={setTimer}
            setIsCounting={setIsCounting}
            className={styles.resendBtn}
          />
          <button onClick={handleVerifyOtp} className={styles.verifyBtn}>
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
}
