const { videoAPI } = require("../utils/api");
const Videos = require("../model/video");

const moodVedeosMap = {
  happy: [
    "upbeat happy songs playlist 2025",
    "full-length feel-good movies",
    "latest cheerful music videos",
    "fun dance songs collection",
    "uplifting family movies",
  ],

  sad: [
    "emotional songs playlist full",
    "tearjerker movies full length",
    "heartbreaking music videos",
    "sad romantic films",
    "melancholic songs collection",
  ],

  calm: [
    "peaceful instrumental albums",
    "meditation music full playlist",
    "relaxing study songs",
    "soothing background music videos",
    "calm piano and guitar tracks",
  ],

  angry: [
    "intense motivational music videos",
    "high-energy workout songs",
    "action movies full length",
    "aggressive rock music albums",
    "powerful rap and hip hop playlists",
  ],

  excited: [
    "energetic party songs playlist",
    "thrilling adventure movies",
    "dance music albums full",
    "fun challenge videos full",
    "latest viral upbeat songs",
  ],
};

const fetchVideos = async (video) => {
  if (!video) return [];
  try {
    const allvideos = [];
    const response = await videoAPI.get("/search", {
      params: { part: "snippet", q: video, type: "video", maxResults: 20 },
    });

    if (response.data && response.data.items) {
      allvideos.push(...response.data.items);
    }
    return allvideos;
  } catch (err) {
    console.log("Error fetching videos:", err.message);
    return [];
  }
};

exports.getVideos = async (req, res, next) => {
  try {
    const { q, mood } = req.query;
    let result = [];
    const query = q?.trim().toLowerCase() || "";
    const moodValue = mood?.trim().toLowerCase() || "";

    await Videos.updateHistory(query, moodValue);

    let videos = query ? await Videos.searchBykeywords(query) : [];
    if (videos.length > 0) {
      videos = await Videos.sortVideos(videos);
    }

    if (!query && moodValue) {
      const categories = moodVedeosMap[moodValue];
      const moodVideos = [];
      for (const cat of categories) {
        const result = await Videos.searchBykeywords(cat.trim().toLowerCase());
        if (result.length > 0) {
          moodVideos.push(...result);
        }
      }
      videos = [...moodVideos];
    }

    if (!query && !moodValue) {
      console.log("No query or mood provided, fetching default happy videos.");
      const categories = moodVedeosMap["happy"];
      let moodVideos = [];
      for (const cat of categories) {
        const result = await Videos.searchBykeywords(
          cat.trim().toLocaleLowerCase()
        );

        if (result.length > 0) {
          moodVideos.push(...result);
        }
      }

      videos = [...moodVideos];
    }

    if (videos.length === 0) {
      if (query) {
        const response = await videoAPI.get("/search", {
          params: { part: "snippet", q: query, type: "videos", maxResults: 50 },
        });

        const storedVideos = await Videos.storeVideos(response.data.items);
        const sortedVideos = await Videos.sortVideos(storedVideos);
        videos = [...sortedVideos];
      } else {
        const categories = moodValue
          ? moodVedeosMap[moodValue]
          : moodVedeosMap["happy"];
        let moodVideos = [];
        for (const cat of categories) {
          const fetchedVideos = await fetchVideos(cat);
          if (fetchedVideos && fetchedVideos.length > 0) {
            moodVideos = moodVideos.concat(fetchVideos);
          }
        }
        videos = [...moodVideos];
      }
    }
    console.log("Total videos fetched:", videos.length);
    if (!videos || videos.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Error fetching videos.",
      });
    }
    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (err) {
    console.log("Error : ", err.stack);
    next(err);
  }
};
