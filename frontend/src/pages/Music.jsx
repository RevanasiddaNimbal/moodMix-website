import { useState } from "react";
import { useLocation } from "react-router-dom";
import MusicList from "../components/musicscomponents/MusicList";
import MiniPlayer from "../components/musicscomponents/MiniPlayer";

import MusicPlayer from "../components/musicscomponents/MusicPlayer";

export default function MusicPage() {
  const [currentSong, setCurrentSong] = useState(null);
  const [expandPlayer, setExpandPlayer] = useState(false);
  const [songs, setSongs] = useState([]);

  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const query = searchParam.get("search");
  const mood = location.state?.mood;

  const handlePlaySong = (songData) => {
    setCurrentSong(songData);
    setExpandPlayer(false);
  };

  // const handleExpandPlayer = () => {
  //   setExpandPlayer(true);
  // };

  const handleClosePlayer = () => {
    setExpandPlayer(false);
  };

  const handleNext = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setExpandPlayer(true);
  };

  const handlePrev = () => {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setExpandPlayer(true);
  };

  return (
    <div
      style={{
        paddingBottom: "1px",
        minHeight: "100vh",
        background: "linear-gradient(100deg, #efd770ff 0%, #40fcbaff 100% )",
        paddingTop: "30px",
      }}
    >
      {/* Music List */}
      <MusicList
        query={query}
        mood={mood}
        onPlaySong={handlePlaySong}
        currentSongId={currentSong?.id}
        setSongs={setSongs} // passes fetched songs for next/prev
      />

      {/* MiniPlayer (compact, fixed at bottom) */}
      {/* {currentSong && !expandPlayer && (
        <MiniPlayer
          currentSong={currentSong}
          onExpand={handleExpandPlayer}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )} */}

      {/* Full Music Player (expanded) */}
      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          expanded={expandPlayer}
          onClose={handleClosePlayer}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
}
