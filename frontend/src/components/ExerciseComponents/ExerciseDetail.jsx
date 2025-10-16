import { loadAgeGenderModel } from "face-api.js";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ExerciseDetail.module.css";
import { useEffect, useState } from "react";

export default function ExerciseDetails() {
  const [instructions, setInstructions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const exercise = location.state?.data || null;
  const image =
    location.state?.image ||
    "https://placehold.co/600x400?text=No+Image+Available";

  useEffect(() => {
    if (exercise?.instructions?.length > 0) {
      setInstructions(exercise.instructions);
    }
  }, [exercise]);

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <img
          src={image}
          alt={exercise.name}
          className={styles.image}
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x400?text=No+Image+Available";
          }}
          loading="lazy"
        />
      </div>
      <div className={styles.rightSide}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className={styles.title}>{exercise.name}</h1>
          <div className={styles.tags}>
            {exercise.target && (
              <span className={styles.tag}>
                Target: <strong>{exercise.target}</strong>
              </span>
            )}
            {exercise.equipment && (
              <span className={styles.tag}>
                Equipment: <strong>{exercise.equipment}</strong>
              </span>
            )}
            {exercise.bodyPart && (
              <span className={styles.tag}>
                Body: <strong>{exercise.bodyPart}</strong>
              </span>
            )}
          </div>
        </header>
        <section className={styles.instruction}>
          <h1 className={styles.instHeadline}>Step by step instructions :</h1>
          {instructions ? (
            <ol className={styles.steps}>
              {instructions.map((inst, index) => (
                <li key={index} className={styles.step}>
                  <span className={styles.stepIndex}>{index + 1}</span>
                  <p className={styles.stepText}>{inst}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.noSteps}>
              Instructions not available for this exercise.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
