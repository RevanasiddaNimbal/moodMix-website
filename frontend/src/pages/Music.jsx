import { useState } from "react";
import { useLocation } from "react-router-dom";
import MusicList from "../components/musicscomponents/MusicList";
import MusicPlayer from "../components/musicscomponents/MusicPlayer";

export default function MusicPage() {
  const [currentSong, setCurrentSong] = useState(null);
  const [songs, setSongs] = useState([]);

  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const query = searchParam.get("search");
  const mood = location.state?.mood;

  const handlePlaySong = (songData) => {
    setCurrentSong(songData);
  };

  return (
    <div>
      <MusicList
        query={query}
        mood={mood}
        onPlaySong={handlePlaySong}
        currentSongId={currentSong?.id}
        setSongs={setSongs}
      />

      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          onClose={handleClosePlayer}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
}
