const { videoAPI } = require("../utils/api");
const Videos = require("../model/video");

const moodVedeosMap = {
  happy: [
    "best feel-good kannada songs full video",
    "funny comedy movie scenes full",
    "joyful music video mix 2025 full length",
    "upbeat dance hits collection 2025 full songs",
    "heartwarming friendship short film full length",
  ],

  sad: [
    "emotional kannada love songs jukebox",
    "sad melody songs collection full album",
    "heart-touching breakup story short film full",
    "painful romantic movie scenes full length",
    "melancholy acoustic cover performances full video",
  ],

  calm: [
    "peaceful nature background video with soft music full",
    "deep sleep meditation music 2 hours non stop",
    "rain sounds with lo-fi chill beats full playlist",
    "calm piano and flute instrumentals full album",
    "relaxing morning yoga music 1 hour",
  ],

  angry: [
    "high energy rock and metal live performance full concert",
    "powerful workout motivation mix full",
    "aggressive rap cypher full session",
    "motivational movie scenes hindi dubbed full length",
    "epic action background score cinematic playlist full",
  ],

  excited: [
    "party dance mix 2025 non stop full songs",
    "latest kannada mass songs jukebox full",
    "festival celebration music videos full length",
    "energetic edm mix 2025 full dj set",
    "adventure travel vlogs cinematic full video",
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
    console.log("Error fetching videos:", err.stack);
    return [];
  }
};

exports.getVideos = async (req, res, next) => {
  try {
    const { q, mood } = req.query;
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
        console.log("Fetching videos for category:", cat);
        const result = await Videos.searchBykeywords(cat.trim().toLowerCase());
        if (result.length > 0) {
          const sortedResult = await Videos.sortVideos(result);
          moodVideos.push(...sortedResult);
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
          const sortedResult = await Videos.sortVideos(result);
          moodVideos.push(...sortedResult);
        }
      }

      videos = [...moodVideos];
    }

    if (videos.length === 0) {
      if (query) {
        const response = await videoAPI.get("/search", {
          params: { part: "snippet", q: query, type: "video", maxResults: 50 },
        });

        await Videos.storeVideos(response.data.items);
        const sortedVideos = await Videos.sortVideos(response.data.items);
        videos = [...sortedVideos];
      } else {
        const categories = moodValue
          ? moodVedeosMap[moodValue]
          : moodVedeosMap["happy"];
        let moodVideos = [];
        for (const cat of categories) {
          const fetchedVideos = await fetchVideos(cat);
          if (fetchedVideos && fetchedVideos.length > 0) {
            await Videos.storeVideos(fetchedVideos);
            moodVideos = moodVideos.concat(fetchedVideos);
          }
        }

        const sortedVideos = await Videos.sortVideos(moodVideos);
        videos = [...sortedVideos];
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
