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

  const videoId = selected?.video_id;
  if (!selected || !videoId || !videos) {
    return <p className={styles.noVideo}>Select a video to play</p>;
  }

  const nextVideos = videos?.filter((v) => v?.id);
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

        <div className={styles.info}>
          <h3>{selected?.title}</h3>
          <p className={styles.description}>{selected?.description}</p>
          <div className={styles.meta}>
            <p>
              <strong>Channel:</strong> {selected?.channel_title}
            </p>
            <p>
              <strong>Published:</strong>{" "}
              {new Date(selected?.published_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

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
              key={video.id}
              className={`${styles.videoItem} ${
                video.video_id === videoId ? styles.selected : ""
              }`}
              onClick={() => handleClick(video)}
            >
              <img
                src={video.thumbnail_medium || video.thumbnail_default}
                alt={video.title}
              />
              <p>{video.title}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
