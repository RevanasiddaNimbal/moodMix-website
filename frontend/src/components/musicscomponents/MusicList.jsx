import { useEffect, useState } from "react";
import axios from "../../api/axios";
import MusicItem from "./MusicItem";
import styles from "./MusicList.module.css";
import LoadingComponent from "../LoadingComponent";

export default function MusicList({ query, mood, onPlaySong, currentSong }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const res = await axios.post("/musics/search/track", {
          q: query,
          mood,
        });
        if (res.data.success) {
          setSongs(res.data.data);
        } else {
          setSongs([]);
        }
      } catch (err) {
        console.error(err);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [query, mood]);

  if (loading) return <LoadingComponent />;

  if (songs.length === 0)
    return (
      <div className={styles.empty}>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAcnaFZe1pPB88jr2oxD4ob7z2SUT39bazVg&s"
          alt="No songs"
        />
        <p>No songs found. Try searching again!</p>
      </div>
    );

  return (
    <div className={styles.listContainer}>
      {songs.map((song) => (
        <MusicItem
          key={song.id}
          song={song}
          onPlaySong={onPlaySong}
          isActive={currentSong === song.title}
        />
      ))}
    </div>
  );
}
