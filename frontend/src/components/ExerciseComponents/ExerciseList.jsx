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

        const imagePromises = res.data.map((ex) =>
          musicAPI.get(`/exercise-image?id=${ex.id}`).then(
            (res) => ({ id: ex.id, url: res.data.url }),
            (err) => ({
              id: ex.id,
              url: "https://placehold.co/1000x900?text=No+Image",
            }),
          ),
        );

        const results = await Promise.all(imagePromises);
        const newImages = {};
        results.forEach((item) => (newImages[item.id] = item.url));
        setImages(newImages);
      } catch (err) {
        console.error("Error fetching exercises:", err.message);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [query, mood]);

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
