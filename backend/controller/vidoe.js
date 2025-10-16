const { videoAPI } = require("../utils/api");

const moodVedeosMap = {
  happy: [
    "funny videos",
    "happy songs playlist",
    "uplifting short films",
    "happy moments compilation",
    "upbeat pop hits",
  ],
  sad: [
    "emotional stories",
    "heartbreak moments",
    "slow sad songs playlist",
    "melancholic music mix",
  ],
  calm: [
    "relaxing nature videos",
    "meditation videos",
    "calm study videos",
    "lofi chill beats playlist",
    "peaceful instrumental music",
  ],
  angry: [
    "intense motivational videos",
    "fight scene compilation",
    "workout motivation playlist",
    "angry rock music",
    "high-energy hip hop",
  ],
  excited: [
    "fun challenge videos",
    "energetic songs playlist",
    "thrilling short films",
    "viral videos compilation",
    "party hits mix",
  ],
};

const fetchVideos = async (Videos) => {
  const moodVideos = [];
  for (const video of Videos.slice(0, 2)) {
    const response = await videoAPI.get("/search", {
      params: { part: "snippet", q: video, type: "videos", maxResults: 5 },
    });
    if (response.data && response.data.items) {
      moodVideos.push(...response.data.items);
    }
  }

  const uniqueVideos = {};
  moodVideos.forEach((video) => {
    uniqueVideos[video.id.videoId] = video;
  });

  return Object.values(uniqueVideos);
};
exports.getVideos = async (req, res, next) => {
  const { q, mood } = req.query;
  let result = [];
  const query = q?.trim().toLowerCase() || "";
  const moodValue = mood?.trim().toLowerCase() || "";

  try {
    if (query) {
      const response = await videoAPI.get("/search", {
        params: { part: "snippet", q: query, type: "videos", maxResults: 5 },
      });

      result = response.data.items;
    } else if (moodValue && moodVedeosMap[moodValue]) {
      const Videos = moodVedeosMap[moodValue];
      result = await fetchVideos(Videos);
    } else {
      const Videos = moodVedeosMap["calm"];
      result = await fetchVideos(Videos);
    }

    if (!result.length) {
      return res.status(400).json({
        success: false,
        error: "Error fetching videos.",
      });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.log("Error : ", err.stack);
    next(err);
  }
};
