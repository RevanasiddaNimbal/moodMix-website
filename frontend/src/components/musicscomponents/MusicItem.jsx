import axios from "../../api/axios";
import styles from "./MusicItem.module.css";

export default function MusicItem({ song, onPlaySong, isActive }) {
  const handleClick = async () => {
    try {
      const res = await axios.get(`/musics/stream/${song.id}`);
      if (res.data.success) onPlaySong(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ""}`}
      onClick={handleClick}
    >
      <img
        src={
          song.artwork_url ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAcnaFZe1pPB88jr2oxD4ob7z2SUT39bazVg&s"
        }
        alt={song.title}
        className={styles.cover}
      />
      <div className={styles.info}>
        <h4>{song.title}</h4>
        <p>{song.user?.username || "Unknown Artist"}</p>
      </div>
      <span className={styles.duration}>
        {Math.floor(song.duration / 60000)}:
        {String(Math.floor((song.duration % 60000) / 1000)).padStart(2, "0")}
      </span>
    </div>
  );
}
