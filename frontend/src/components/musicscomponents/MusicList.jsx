import { useEffect, useState } from "react";
import axios from "../../api/axios";
import MusicItem from "./MusicItem";
import styles from "./MusicList.module.css";

export default function MusicList({
  query,
  mood,
  onPlaySong,
  currentSongId,
  setSongs: setParentSongs,
}) {
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
          if (setParentSongs) setParentSongs(res.data.data);
        } else {
          setSongs([]);
          if (setParentSongs) setParentSongs([]);
        }
      } catch (err) {
        console.error(err);
        setSongs([]);
        if (setParentSongs) setParentSongs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [query, setParentSongs, mood]);

  if (loading) return <div className={styles.loading}>loading songs...</div>;

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
          isActive={currentSongId === song.id}
        />
      ))}
    </div>
  );
}
