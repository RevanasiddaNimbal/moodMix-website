const { videoAPI } = require("../utils/api");
const Videos = require("../model/video");

const moodVedeosMap = {
  happy: [
    "positive kannada inspirational songs full length",
    "uplifting instrumental music full album",
    "motivational documentary on positive mindset full",
    "light classical music compilation full length",
    "inspiring human achievement documentary full",
  ],

  sad: [
    "emotional classical instrumental music full album",
    "soft reflective music compilation full length",
    "motivational lecture on overcoming challenges full session",
    "life lessons documentary full length",
    "reflective poetry narration full program",
  ],

  calm: [
    "guided mindfulness meditation full session",
    "soft instrumental relaxation music full album",
    "nature documentary with ambient sound full length",
    "classical flute and piano music full album",
    "yoga and breathing exercises full session",
  ],

  angry: [
    "stress management lecture full session",
    "emotional regulation techniques seminar full",
    "discipline and self improvement documentary full length",
    "focus enhancing instrumental background music full album",
    "mental resilience educational talk full session",
  ],

  excited: [
    "motivational success stories documentary full length",
    "innovation and technology documentary full program",
    "inspirational leadership speech full session",
    "educational travel documentary full length",
    "career growth and self development lecture full",
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
          cat.trim().toLocaleLowerCase(),
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
