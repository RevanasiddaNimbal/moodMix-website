import { useEffect, useState } from "react";
import styles from "./Herosection.module.css";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../Message";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    axios
      .get("/auth/verify")
      .then((res) => {
        if (res.data.success) {
          setIsAuthed(true);
        }
      })
      .catch(() => {
        setIsAuthed(false);
      });
  }, []);

  const handleStart = async () => {
    if (isAuthed) {
      navigate("/capture-face");
    } else {
      await showMessage("User not logged in. Please login");
      navigate("/login");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mood Based Music & Video</h1>
      <p className={styles.subtitle}>
        Your emotions tell a story. We turn that story into a soundtrack and a
        visual journey that comforts, inspires, and empowers you.
      </p>

      <button className={styles.startedBtn} onClick={handleStart}>
        Get Started
      </button>
    </div>
  );
}
