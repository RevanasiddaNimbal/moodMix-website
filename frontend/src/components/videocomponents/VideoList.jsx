import styles from "./VideoList.module.css";
import { useNavigate } from "react-router-dom";

export default function VideosList({ videos }) {
  const navigate = useNavigate();

  const handleVideoClick = (video) => {
    navigate(`/videos/watch/${video?.video_id}`, {
      state: { selected: video, videos: videos },
    });
  };

  return (
    <div className={styles.container}>
      {videos.length === 0 ? (
        <p className={styles.noVideos}>No videos found.</p>
      ) : (
        <div className={styles.videoGrid}>
          {videos.map((video, index) => (
            <div
              key={video?.video_id || index}
              className={styles.videoCard}
              onClick={() => handleVideoClick(video)}
            >
              <div className={styles.thumbnailWrapper}>
                <img
                  src={video?.thumbnail_medium || video?.thumbnail_default}
                  alt={video?.title}
                  className={styles.thumbnail}
                  loading="lazy"
                />
                {video?.liveBroadcastContent === "live" && (
                  <span className={styles.liveBadge}>LIVE</span>
                )}
              </div>

              <div className={styles.videoInfo}>
                <h3 className={styles.title}>{video?.title}</h3>
                <div className={styles.meta}>
                  <p className={styles.channel}>{video?.channel_title}</p>
                  <p className={styles.date}>
                    {video?.published_at
                      ? new Date(video?.published_at).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
