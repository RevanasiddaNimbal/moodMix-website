import styles from "./VideoPlayer.module.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function VideoPlayer() {
  const location = useLocation();

  const selected = location.state?.selected;
  const videos = location.state?.videos;
  const videoId = selected?.id?.videoId;

  if (!selected || !videoId || !videos) {
    return <p className={styles.noVideo}>Select a video to play</p>;
  }

  const snippet = selected.snippet || {};

  const nextVideos = videos?.filter(
    (v) => v?.id?.videoId && v.id.videoId !== videoId
  );
  console.log(nextVideos);
  return (
    <div className={styles.container}>
      {/* Left side - main video */}
      <div className={styles.mainVideo}>
        <iframe
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={snippet.title || "YouTube video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

        {/* Video info */}
        <div className={styles.info}>
          <h3>{snippet?.title}</h3>
          <p>{snippet?.description}</p>
          <p>
            <strong>Channel:</strong> {snippet?.channelTitle}
          </p>
          <p>
            <strong>Published:</strong>{" "}
            {new Date(snippet?.publishedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Right side - next videos */}
      <div className={styles.nextVideos}>
        <h4>Next Videos</h4>
        {nextVideos?.length === 0 ? (
          <p>No other videos found.</p>
        ) : (
          nextVideos?.map((video) => (
            <div key={video.id.videoId} className={styles.videoItem}>
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
