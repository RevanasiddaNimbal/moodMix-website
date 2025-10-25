import { useEffect, useState } from "react";
import musicAPI from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ExerciseList.module.css";
import LoadingComponent from "../Loading";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const searchParam = new URLSearchParams(location.search);
  const query = searchParam.get("search");
  const mood = location.state?.mood;

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await musicAPI.get(`/exercises`, {
          params: { q: query, mood },
        });
        setExercises(res.data || []);
      } catch (err) {
        console.error("Error fetching exercises:", err.message);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [query, mood]);

  useEffect(() => {
    const fetchImages = async () => {
      const promises = exercises.map(async (exercise) => {
        try {
          const res = await musicAPI.get(`/exercise-image?id=${exercise.id}`);
          return { id: exercise.id, url: res.data.url };
        } catch (err) {
          console.error("Error loading image:", err.message);
          return {
            id: exercise.id,
            url: "https://placehold.co/1000x900?text=No+Image+Available",
          };
        }
      });

      const results = await Promise.all(promises);
      const newImages = {};
      results.forEach((item) => {
        newImages[item.id] = item.url;
      });

      setImages(newImages);
    };

    if (exercises.length > 0) fetchImages();
  }, [exercises]);

  if (loading) return <LoadingComponent />;

  if (!exercises.length)
    return <p className={styles.empty}>No exercises found.</p>;

  const handleStart = (exercise, img) => {
    navigate(`/exercise/${exercise.id}`, {
      state: { data: exercise, image: img },
    });
  };

  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.headline}>Step Into Your Strength Zone</h1>
      <main className={styles.container}>
        {exercises.map((exercise) => (
          <article key={exercise.id} className={styles.card}>
            <div className={styles.media}>
              <img
                src={
                  images[exercise.id] ||
                  "https://placehold.co/600x400?text=Loading..."
                }
                alt={exercise.name}
                className={styles.image}
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/600x400?text=No+Image+Available";
                }}
                loading="lazy"
              />
            </div>

            <div className={styles.content}>
              <h1 className={styles.title} title={exercise.name}>
                {exercise.name}
              </h1>

              <div className={styles.contentText}>
                <div className={styles.box}>
                  <span className={styles.boxLabel}>Target :</span>
                  <span className={styles.boxValue}>{exercise.target}</span>
                </div>
                <div className={styles.box}>
                  <span className={styles.boxLabel}>Equipment :</span>
                  <span className={styles.boxValue}>{exercise.equipment}</span>
                </div>
              </div>

              <button
                type="button"
                className={styles.startBtn}
                onClick={() => handleStart(exercise, images[exercise.id])}
              >
                Start
              </button>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
