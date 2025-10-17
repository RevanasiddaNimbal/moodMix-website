import videoAPI from "../api/axios";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import VideosList from "../components/videocomponents/videosList";
import VideoPlayer from "../components/videocomponents/VideoPlayer";

export default function Video() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const location = useLocation();
  const searchParam = new URLSearchParams(location.search);
  const query = searchParam.get("search");
  const mood = location.state?.mood;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await videoAPI.get("/videos/search", {
          params: {
            q: query,
            mood,
          },
        });

        if (response.status === 200 && response.data?.success) {
          setVideos(response.data.data);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.log(err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [query, mood]);

  if (loading) return <p>loading...</p>;

  return (
    <div>
      <VideosList videos={videos} />
    </div>
  );
}
