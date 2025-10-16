import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import styles from "./Facecapture.module.css";
import { useNavigate } from "react-router-dom";

export default function DetectExpression({ onResult }) {
  const webcamref = useRef(null);
  const [loading, setloading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [expression, setExpression] = useState("");
  const [UserSelect, setUserSelect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    const detect = async () => {
      if (!webcamref.current) return;

      const imagescr = webcamref.current.getScreenshot();
      if (!imagescr) return;

      setDetecting(true);
      const img = new Image();
      img.src = imagescr;

      img.onload = async () => {
        const detection = await faceapi
          .detectSingleFace(
            img,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.8 })
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        if (!detection) {
          setExpression("detection of face failed.");
          setDetecting(false);
          return;
        }

        const expressions = detection.expressions;
        let bestepxression = "";
        let bestvalue = 0;

        for (const [key, value] of Object.entries(expressions)) {
          if (value > bestvalue) {
            bestvalue = value;
            bestepxression = key;
          }
        }

        const result = `you look: ${bestepxression} (${(
          bestvalue * 100
        ).toFixed(1)}%)`;

        if (!UserSelect) {
          setExpression(result);
          navigate("/user-choice", {
            state: { mood: bestepxression, value: bestvalue },
          });
        }
        setDetecting(false);
      };
    };
    const loadmodel = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setloading(false);

      interval = setInterval(detect, 5000);
    };

    loadmodel();

    return () => clearInterval(interval);
  }, []);

  const handleUserSelect = (mood) => {
    setExpression(mood);
    setUserSelect(true);
    navigate("/user-choice", { state: { mood } });
  };
  return (
    <div className={styles.container}>
      <Webcam
        ref={webcamref}
        width={160}
        height={120}
        screenshotFormat="image/jpeg"
        className={styles.webcamPulse}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "10px",
          border: "2px solid #fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        }}
      />

      <div
        className={`${styles.faceIcon} ${
          expression ? styles.faceDetected : styles.faceSearching
        }`}
      >
        ☺️
      </div>
      <div className={styles.status}>
        {loading
          ? "Loading models..."
          : detecting
          ? "Detecting mood..."
          : expression
          ? `Detected Mood: ${expression}`
          : "Select your mood below!"}
      </div>

      <div className={styles.cardsWrapper}>
        <div
          className={`${styles.card} ${styles.happy}`}
          onClick={() => handleUserSelect("happy")}
        >
          <div className={styles.cardIcon}>
            <div className={styles.shape}>😄</div>
          </div>
          <span className={styles.cardLabel}>Happy</span>
        </div>

        <div
          className={`${styles.card} ${styles.sad}`}
          onClick={() => handleUserSelect("sad")}
        >
          <div className={styles.cardIcon}>
            <div className={styles.shape}>😥</div>
          </div>
          <span className={styles.cardLabel}>Sad</span>
        </div>

        <div
          className={`${styles.card} ${styles.calm} `}
          onClick={() => handleUserSelect("calm")}
        >
          <div className={styles.cardIcon}>
            <div className={styles.shape}>😌</div>
          </div>
          <span className={styles.cardLabel}>Calm</span>
        </div>

        <div
          className={`${styles.card} ${styles.angry}`}
          onClick={() => handleUserSelect("angry")}
        >
          <div className={styles.cardIcon}>
            <div className={styles.shape}>😡</div>
          </div>
          <span className={styles.cardLabel}>Angry</span>
        </div>

        <div
          className={`${styles.card} ${styles.exited} `}
          onClick={() => handleUserSelect("exited")}
        >
          <div className={styles.cardIcon}>
            <div className={styles.shape}>🤩</div>
          </div>
          <span className={styles.cardLabel}>Excited</span>
        </div>
      </div>
    </div>
  );
}
