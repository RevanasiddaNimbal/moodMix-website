import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./ChooseVibe.module.css";

export default function ChooseVibe() {
  const navigate = useNavigate();
  const location = useLocation();
  let mood = location.state?.mood || "";
  const value = location.state?.value || "";
  if (mood == "neutral" && value > 90) {
    mood = "happy";
  } else if (!mood && value < 90) {
    mood = "clam";
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Choose Your Vibe</h1>
          <p>Music, videos, and exercises to match your {mood} mood.</p>
        </div>

        <div className={`${styles.cards} ${styles.musicCard}`}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUrrQ4YjqxNAbs9lHkHo9c9H733_G_YM2QJA&s"
            alt="music image"
          />

          <div className={styles.text}>
            {" "}
            <h1>Music</h1>Millions of songs. No credit card needed.
          </div>
          <button onClick={() => navigate("/musics", { state: { mood } })}>
            Explore Musics
          </button>
        </div>
        <div className={`${styles.cards} ${styles.videoCard}`}>
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/057/265/537/small/a-polished-silver-play-button-symbol-representing-or-audio-playback-on-a-light-background-photo.JPG"
            alt="videoImage"
          />

          <div className={styles.text}>
            {" "}
            <h1>Videos</h1>Watch musics videos,exclusive shows,and more.
          </div>
          <button onClick={() => navigate("/videos", { state: { mood } })}>
            Watch Now
          </button>
        </div>
        <div className={`${styles.cards} ${styles.exerciseCard}`}>
          <img
            src="https://img.freepik.com/premium-vector/logo-gym-that-says-fitness-fitness_427757-42886.jpg?w=360"
            alt="exerciseImage"
          />

          <div className={styles.text}>
            {<h1>Exercises</h1>}Find the perfect workout, from yoga to strength
            training.
          </div>
          <button onClick={() => navigate("/exercise", { state: { mood } })}>
            Get Moving
          </button>
        </div>
      </main>
    </div>
  );
}
