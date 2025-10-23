import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import styles from "./Message.module.css";

function MessageAlert({ message, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={styles.alertContainer}>
      <div className={styles.alertBox}>{message}</div>
    </div>
  );
}

export function showMessage(message) {
  return new Promise((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);

    const handleDone = () => {
      root.unmount();
      div.remove();
      resolve();
    };

    root.render(<MessageAlert message={message} onDone={handleDone} />);
  });
}
