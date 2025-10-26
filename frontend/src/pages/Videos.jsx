import videoAPI from "../api/axios";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import VideosList from "../components/videocomponents/VideoList";
import LoadingComponent from "../components/Loading";

export default function Video() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const searchParam = new URLSearchParams(location.search);
  const query = searchParam.get("search");
  const mood = location.state?.mood;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await videoAPI.get("/videos/search", {
          params: {
            q: query,
            mood,
          },
        });

        if (response.status === 200 && response.data?.success) {
          setVideos(response.data.data);
          console.log("Fetched videos:", response.data.data);
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

  if (loading) return <LoadingComponent />;

  return (
    <div>
      <VideosList videos={videos} />
    </div>
  );
}
