const { videoAPI } = require("../utils/api");
const Videos = require("../model/video");

const moodVideosMap = {
  happy: ["positive classical instrumental songs compilation"],
  sad: ["emotional classical instrumental music full album"],
  calm: ["relaxing instrumental nature sounds compilation"],
  angry: ["focus enhancing instrumental background music full album"],
  excited: ["motivational instrumental success music full album"],
};

const fetchVideos = async (query) => {
  try {
    const response = await videoAPI.get("/search", {
      params: { part: "snippet", q: query, type: "video", maxResults: 20 },
    });

    return response.data?.items || [];
  } catch (err) {
    console.error(`fetchVideos error for "${query}":`, err.message);
    return [];
  }
};

exports.getVideos = async (req, res, next) => {
  try {
    const userId = req.id;
    const { q, mood } = req.query;
    const query = q?.trim().toLowerCase() || "";
    const moodValue = mood?.trim().toLowerCase() || "happy";
    let searchTerm;

    if (query || moodValue) {
      Videos.updateHistory(userId, query, moodValue).catch((err) =>
        console.error("updateHistory silent error:", err.message),
      );
    }

    let videosList = [];

    if (query && query.length > 0) {
      searchTerm = query;
    } else {
      searchTerm = moodVideosMap[moodValue]?.[0] || moodVideosMap["happy"][0];
    }

    videosList = await Videos.searchBykeywords(userId, searchTerm, moodValue);

    if (videosList.length === 0) {
      const fetchResults = await fetchVideos(searchTerm);
      videosList = await Videos.storeVideos(fetchResults);
    }

    const newVideosIds = videosList.map((v) => v.video_id);
    const personalizedFeed = await Videos.sortVideos(
      userId,
      moodValue,
      newVideosIds,
      100,
    );

    const videos = [...videosList, ...personalizedFeed];

    const uniqueFeed = [
      ...new Map(videos.map((v) => [v.video_id, v])).values(),
    ];

    if (!uniqueFeed || uniqueFeed.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No videos found. Please try again later.",
      });
    }

    return res.status(200).json({ success: true, data: uniqueFeed });
  } catch (err) {
    console.error("getVideos error:", err.stack);
    next(err);
  }
};
