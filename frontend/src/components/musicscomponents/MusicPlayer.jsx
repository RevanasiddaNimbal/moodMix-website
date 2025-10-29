import React, { useRef, useState, useEffect } from "react";
import styles from "./MusicPlayer.module.css";

// SVG Icons for a clean, professional look
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);
const NextIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);
const PrevIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);
const VolumeHighIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);
const VolumeMuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 9v6h4l5 5V4L7 9H3zm7.58 3l-4.58-4.59L8.41 9l6 6 1.59-1.59L14 11.83zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" />
  </svg>
);
const UpArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
  </svg>
);
const DownArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
  </svg>
);

export default function MusicPlayer({ currentSong = {}, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.progressiveUrl) return;

    audio.src = currentSong.progressiveUrl;
    audio.load();

    const handleCanPlay = async () => {
      setDuration(audio.duration);
      try {
        await audio.play();
        setPlaying(true);
      } catch (error) {
        console.warn("Autoplay was prevented.", error);
        setPlaying(false);
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    return () => audio.removeEventListener("canplay", handleCanPlay);
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.playbackRate = speed;
  }, [volume, isMuted, speed]);

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => setTime(audioRef.current.currentTime);
  const handleSeek = (e) =>
    (audioRef.current.currentTime = Number(e.target.value));
  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
    if (Number(e.target.value) > 0) setIsMuted(false);
  };
  const handleSpeedChange = (e) => setSpeed(Number(e.target.value));
  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (s) =>
    isNaN(s)
      ? "0:00"
      : `${Math.floor(s / 60)}:${Math.floor(s % 60)
          .toString()
          .padStart(2, "0")}`;
  const progressPercentage = duration > 0 ? (time / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  return (
    <div className={styles.playerRoot} data-expanded={expanded}>
      <div
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-hidden={!expanded}
      >
        <div className={styles.overlayHeader}>
          <button
            onClick={() => setExpanded(false)}
            className={styles.overlayButton}
            aria-label="Collapse player"
          >
            <DownArrowIcon />
          </button>
        </div>
        <div className={styles.playerCard}>
          <div className={styles.artworkWrapper}>
            <img
              src={
                currentSong.artwork_url ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAcnaFZe1pPB88jr2oxD4ob7z2SUT39bazVg&s"
              }
              alt={currentSong.title || "Album Art"}
              className={styles.artwork}
            />
          </div>
          <div className={styles.trackInfo}>
            <h2 className={styles.title}>
              {currentSong.title || "Choose a Song"}
            </h2>
            <p className={styles.artist}>
              {currentSong.artist || "Unknown Artist"}
            </p>
          </div>
          <div className={styles.progress}>
            <input
              type="range"
              min="0"
              max={duration}
              value={time}
              onChange={handleSeek}
              className={styles.seekBar}
              aria-label="Seek progress"
              style={{ "--progress": `${progressPercentage}%` }}
            />
            <div className={styles.timeStamps}>
              <span>{formatTime(time)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className={styles.mainControls}>
            <button
              onClick={onPrev}
              className={styles.controlButton}
              aria-label="Previous song"
            >
              <PrevIcon />
            </button>
            <button
              onClick={togglePlay}
              className={`${styles.controlButton} ${styles.playButton}`}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={onNext}
              className={styles.controlButton}
              aria-label="Next song"
            >
              <NextIcon />
            </button>
          </div>
          <div className={styles.volumeAndSpeed}>
            <button
              onClick={toggleMute}
              className={styles.volumeButton}
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeMuteIcon />
              ) : (
                <VolumeHighIcon />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Volume"
              style={{ "--volume": `${volumePercentage}%` }}
            />
            <select
              value={speed}
              onChange={handleSpeedChange}
              className={styles.speedSelect}
              aria-label="Playback speed"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          <img
            src={
              currentSong.artwork_url ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAcnaFZe1pPB88jr2oxD4ob7z2SUT39bazVg&s"
            }
            alt=""
            className={styles.smallArtwork}
          />
          <div className={styles.smallTrackInfo}>
            <div className={styles.smallTitle}>
              {currentSong.title || "No Song"}
            </div>
            <div className={styles.smallArtist}>
              {currentSong.artist || "..."}
            </div>
          </div>
        </div>

        <div className={styles.bottomBarCenter}>
          <div className={styles.barControls}>
            <button
              onClick={onPrev}
              className={`${styles.controlButton} ${styles.desktopOnly}`}
              aria-label="Previous song"
            >
              <PrevIcon />
            </button>
            <button
              onClick={togglePlay}
              className={`${styles.controlButton} ${styles.barPlayButton}`}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={onNext}
              className={styles.controlButton}
              aria-label="Next song"
            >
              <NextIcon />
            </button>
          </div>
          <div className={`${styles.progress} ${styles.desktopOnly}`}>
            <span className={styles.timeStampsDesktop}>{formatTime(time)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={time}
              onChange={handleSeek}
              className={styles.seekBar}
              aria-label="Seek progress"
              style={{ "--progress": `${progressPercentage}%` }}
            />
            <span className={styles.timeStampsDesktop}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className={styles.bottomBarRight}>
          <div className={`${styles.volumeControls} ${styles.desktopOnly}`}>
            <button
              onClick={toggleMute}
              className={styles.volumeButton}
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeMuteIcon />
              ) : (
                <VolumeHighIcon />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Volume"
              style={{ "--volume": `${volumePercentage}%` }}
            />
          </div>
          <select
            value={speed}
            onChange={handleSpeedChange}
            className={`${styles.speedSelect} ${styles.desktopOnly}`}
            aria-label="Playback speed"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
          <button
            onClick={() => setExpanded(true)}
            className={`${styles.controlButton} ${styles.mobileOnly}`}
            aria-label="Expand player"
          >
            <UpArrowIcon />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setDuration(audioRef.current.duration)}
        onEnded={onNext}
      />
    </div>
  );
}
