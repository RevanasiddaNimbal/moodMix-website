import { useEffect } from "react";
import styles from "./Timer.module.css";
export default function Timer({ isCounting, setIsCounting, timer, setTimer }) {
  useEffect(() => {
    if (!isCounting) return;

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsCounting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isCounting, setTimer, setIsCounting]);
  return (
    <p className={styles.resendText}>
      Didn't receive OTP?
      {timer > 0 ? (
        <span className={styles.timer}> Resend in {timer}s</span>
      ) : (
        <span className={styles.timeoff}>Receive OTP Again</span>
      )}
    </p>
  );
}
