import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useEffect, useState } from "react";
import Timer from "./Timer";
import ResendOtp from "./ResendOtp";
import styles from "./VerifyOtp.module.css";
import { showMessage } from "../Message";
import { useRef } from "react";

export default function VerifyOtp() {
  const location = useLocation();
  const { email } = location.state || {};
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const navigate = useNavigate();
  const verifyBtnRef = useRef(null);

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
      await showMessage("Please enter OTP.");
      return;
    }

    try {
      console.log("Verifying OTP for email:", email);
      const res = await axios.post("/auth/verify-otp", {
        email: email,
        otp,
      });

      if (res.data?.success) {
        await showMessage(res.data.message || "OTP verified successfully!");
        navigate("/login");
      } else {
        await showMessage(res.data?.error || "Invalid OTP, please try again.");
        setOtp("");
      }
    } catch (err) {
      console.error("OTP verify error:", err.response || err.message);
      await showMessage(
        err.response?.data?.error ||
          "Error verifying OTP. Please try again later.",
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
          maxLength={6}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setOtp(value);

            if (value.length === 6) {
              verifyBtnRef.current?.classList.add(styles.glow);
              verifyBtnRef.current?.click();

              setTimeout(() => {
                verifyBtnRef.current?.classList.remove(styles.glow);
              }, 1500);
            }
          }}
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
          <button
            ref={verifyBtnRef}
            onClick={handleVerifyOtp}
            className={styles.verifyBtn}
          >
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
}
