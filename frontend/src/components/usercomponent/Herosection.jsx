import { useEffect, useState } from "react";
import styles from "./Herosection.module.css";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/auth/verify", {
        headers: { "x-verify-token": token },
      })
      .then((res) => {
        if (res.data.success) {
          setIsAuthed(true);
        }
      })
      .catch(() => {
        setIsAuthed(false);
        localStorage.removeItem("token");
      });
  }, []);

  const handleStart = () => {
    if (isAuthed) {
      navigate("/capture-face");
    } else {
      alert("User not loged in. Please login.");
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
