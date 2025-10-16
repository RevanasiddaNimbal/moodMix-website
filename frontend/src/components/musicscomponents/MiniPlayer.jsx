import { useRef, useState, useEffect } from "react";
import styles from "./MiniPlayer.module.css";

export default function MiniPlayer({ currentSong, onExpand, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    audioRef.current.src = currentSong.progressiveUrl;
    audioRef.current.play();
    setPlaying(true);
  }, [currentSong]);

  if (!currentSong) return null;

  const togglePlay = (e) => {
    e.stopPropagation(); // prevents expanding
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div className={styles.miniPlayer} onClick={onExpand}>
      <img
        src={
          currentSong.artwork ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAcnaFZe1pPB88jr2oxD4ob7z2SUT39bazVg&s"
        }
        alt={currentSong.title}
        className={styles.cover}
      />
      <span className={styles.title}>{currentSong.title}</span>

      <div className={styles.controls} onClick={(e) => e.stopPropagation()}>
        <button onClick={onPrev}>⏮</button>
        <button onClick={togglePlay}>{playing ? "❚❚" : "▶"}</button>
        <button onClick={onNext}>⏭</button>
        <span className={styles.duration}>
          {Math.floor(currentSong.duration / 60000)}:
          {String(Math.floor((currentSong.duration % 60000) / 1000)).padStart(
            2,
            "0"
          )}
        </span>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
