import { useRef, useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./MusicPlayer.module.css";

export default function MusicPlayer({ currentSong, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [active, setActive] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = currentSong.progressiveUrl;
    audio.load();

    const playAfterLoad = async () => {
      try {
        audio.volume = volume;
        audio.muted = muted;
        await audio.play();
        setPlaying(true);
        setActive(null);
      } catch (err) {
        console.warn("Autoplay blocked, user must press play:", err);
        setPlaying(false);
      }
    };

    audio.addEventListener("loadedmetadata", playAfterLoad);
    return () => {
      audio.removeEventListener("loadedmetadata", playAfterLoad);
    };
  }, [currentSong]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (err) {
        console.warn("Play failed:", err);
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMute = !muted;
    setMuted(newMute);
    audioRef.current.muted = newMute;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100
    );
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const bar = e.currentTarget.getBoundingClientRect();
    const newTime =
      ((e.clientX - bar.left) / bar.width) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress((newTime / audioRef.current.duration) * 100);
  };

  const handleSeekTouchStart = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const touch = e.touches[0];
    const bar = e.currentTarget.getBoundingClientRect();
    const newTime =
      ((touch.clientX - bar.left) / bar.width) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress((newTime / audioRef.current.duration) * 100);
  };

  const handleVolumeStart = (e) => {
    handleVolumeMove(e);
    window.addEventListener("mousemove", handleVolumeMove);
    window.addEventListener("mouseup", handleVolumeEnd);
  };

  const handleVolumeMove = (e) => {
    const bar = document.getElementById("volume-bar");
    if (!bar || !audioRef.current) return;
    const rect = bar.getBoundingClientRect();
    let newVolume = (e.clientX - rect.left) / rect.width;
    newVolume = Math.max(0, Math.min(newVolume, 1));
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume > 0 && muted) {
      setMuted(false);
      audioRef.current.muted = false;
    }
  };

  const handleVolumeEnd = () => {
    window.removeEventListener("mousemove", handleVolumeMove);
    window.removeEventListener("mouseup", handleVolumeEnd);
  };

  const handleVolumeTouchStart = (e) => {
    const bar = document.getElementById("volume-bar");
    if (!bar || !audioRef.current) return;
    const touch = e.touches[0];
    const rect = bar.getBoundingClientRect();
    let newVolume = (touch.clientX - rect.left) / rect.width;
    newVolume = Math.max(0, Math.min(newVolume, 1));
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume > 0 && muted) {
      setMuted(false);
      audioRef.current.muted = false;
    }
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = (type) => {
    setActive(active === type ? null : type);
  };

  const playerRef = useRef(null);

  const toggleFullScreen = async () => {
    const element = playerRef.current;

    if (!element) return;

    if (!isFullScreen) {
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
        setIsFullScreen(true);
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        setIsFullScreen(false);
      } catch (err) {
        console.warn("Exit fullscreen failed:", err);
      }
    }
  };

  return (
    <div
      ref={playerRef}
      className={styles.playerContainer}
      data-collapsed={isMobile ? "true" : "false"}
    >
      <div className={styles.left}>
        <img
          src={
            currentSong.artwork ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAcnaFZe1pPB88jr2oxD4ob7z2SUT39bazVg&s" ||
            "/placeholder.svg"
          }
          alt={currentSong.title}
          className={styles.cover}
        />

        <div className={styles.info}>
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist || "Unknown Artist"}</p>
        </div>
      </div>

      <div className={styles.controls}>
        <button onClick={onPrev}>⏮</button>
        <button onClick={togglePlay}>{playing ? "❚❚" : "▶"}</button>
        <button onClick={onNext}>⏭</button>
        <span className={styles.time}>
          {formatTime(audioRef.current?.currentTime)} /{" "}
          {formatTime(audioRef.current?.duration)}
        </span>
        <div
          className={styles.seekbar}
          onMouseDown={handleSeek}
          onTouchStart={handleSeekTouchStart}
        >
          <div className={styles.progress} style={{ width: `${progress}%` }} />
          <div className={styles.seekThumb} style={{ left: `${progress}%` }} />
        </div>

        <div className={styles.speedMenuWrapper}>
          <button
            className={styles.speedButton}
            aria-haspopup="menu"
            aria-expanded={showSpeedMenu}
            onClick={() => setShowSpeedMenu((v) => !v)}
          >
            {speed}x
          </button>
          {showSpeedMenu && (
            <div className={styles.speedMenu} role="menu">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((val) => (
                <button
                  key={val}
                  role="menuitemradio"
                  aria-checked={speed === val}
                  className={`${styles.speedItem} ${
                    speed === val ? styles.speedItemActive : ""
                  }`}
                  onClick={() => {
                    setSpeed(val);
                    setShowSpeedMenu(false);
                  }}
                >
                  {val}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.likeDislike}>
        <button
          className={active === "like" ? styles.active : ""}
          onClick={() => handleClick("like")}
          aria-label="Like"
          title="Like"
        >
          <ThumbsUp size={22} />
        </button>
        <button
          className={active === "dislike" ? styles.active : ""}
          onClick={() => handleClick("dislike")}
          aria-label="Dislike"
          title="Dislike"
        >
          <ThumbsDown size={22} />
        </button>
      </div>

      <div className={styles.volumeWrapper}>
        <button className={styles.muteButton} onClick={toggleMute}>
          {muted || volume === 0 ? (
            <VolumeX size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </button>
        <div
          id="volume-bar"
          className={styles.volumeContainer}
          onMouseDown={handleVolumeStart}
          onTouchStart={handleVolumeTouchStart}
        >
          <div
            className={styles.volumeFill}
            style={{ width: muted ? "0%" : `${volume * 100}%` }}
          ></div>
          <div
            className={styles.volumeThumb}
            style={{ left: muted ? "0%" : `${volume * 100}%` }}
          ></div>
        </div>
      </div>

      <button className={styles.fullscreenBtn} onClick={toggleFullScreen}>
        {isFullScreen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={onNext} />
    </div>
  );
}
