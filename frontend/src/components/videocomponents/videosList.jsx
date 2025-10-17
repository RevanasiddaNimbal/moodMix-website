import { useState } from "react";
import styles from "./videosList.module.css";
import { useNavigate } from "react-router-dom";

export default function VideosList({ videos }) {
  const navigate = useNavigate();

  const handleVideoClick = (video) => {
    navigate(`/videos/watch/${video?.id?.videoId}`, {
      state: { selected: video, videos: videos },
    });
  };

  return (
    <div className={styles.container}>
      {videos.length === 0 ? (
        <p className={styles.noVideos}>No videos found.</p>
      ) : (
        <div className={styles.videoGrid}>
          {videos.map((video) => (
            <div
              key={video.id.videoId}
              className={styles.videoCard}
              onClick={() => handleVideoClick(video)}
            >
              <div className={styles.thumbnailWrapper}>
                <img
                  src={video.snippet?.thumbnails?.medium?.url}
                  alt={video.snippet?.title}
                  className={styles.thumbnail}
                  loading="lazy"
                />
                {video.snippet?.liveBroadcastContent === "live" && (
                  <span className={styles.liveBadge}>LIVE</span>
                )}
              </div>

              <div className={styles.videoInfo}>
                <h3 className={styles.title}>{video.snippet?.title}</h3>
                <p className={styles.channel}>{video.snippet?.channelTitle}</p>
                <p className={styles.date}>
                  {video.snippet?.publishedAt
                    ? new Date(video.snippet.publishedAt).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
