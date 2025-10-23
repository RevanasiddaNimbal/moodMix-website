import styles from "./VideoPlayer.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import YouTube from "react-youtube";

export default function VideoPlayer() {
  const location = useLocation();
  const navigate = useNavigate();

  let initSelected = location.state?.selected;
  const videos = location.state?.videos;

  const [selected, setSelected] = useState(initSelected);

  const snippet = selected.snippet || {};
  const videoId = selected?.id?.videoId;
  if (!selected || !videoId || !videos) {
    return <p className={styles.noVideo}>Select a video to play</p>;
  }

  const nextVideos = videos?.filter((v) => v?.id?.videoId);
  const handleClick = (video) => {
    setSelected(video);
  };
  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 1,
      modestbranding: 1,
      disablekb: 1,
      fs: 1,
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainVideo}>
        <div className={styles.playerWrapper}>
          <YouTube
            videoId={videoId}
            opts={opts}
            className={styles.youtubePlayer}
          />
        </div>

        {/* Video info */}
        <div className={styles.info}>
          <h3>{snippet?.title}</h3>
          <p className={styles.description}>{snippet?.description}</p>
          <div className={styles.meta}>
            <p>
              <strong>Channel:</strong> {snippet?.channelTitle}
            </p>
            <p>
              <strong>Published:</strong>{" "}
              {new Date(snippet?.publishedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - next videos */}
      <div className={styles.nextVideos}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h4>Next Videos</h4>
        {nextVideos?.length === 0 ? (
          <p>No other videos found.</p>
        ) : (
          nextVideos?.map((video) => (
            <div
              key={video.id.videoId}
              className={`${styles.videoItem} ${
                video.id.videoId === videoId ? styles.selected : ""
              }`}
              onClick={() => handleClick(video)}
            >
              <img
                src={video.snippet.thumbnails.default.url}
                alt={video.snippet.title}
              />
              <p>{video.snippet.title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
