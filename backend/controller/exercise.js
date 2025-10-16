const { exerciseAPI } = require("../utils/api");
const moodMap = {
  happy: ["calves", "glutes", "cardiovascular system"], // energetic/lower-body
  sad: ["abs", "spine", "upper back"], // core + posture improving
  calm: ["serratus anterior", "forearms", "levator scapulae"], // relaxing/stretch-based targets
  angry: ["pectorals", "delts", "triceps"], // push exercises, anger outlet
  excited: ["quads", "hamstrings", "lats"], // full-body dynamic targets
};
const cache = {};
function setCache(endpoint, data, ttl = 600000) {
  cache[endpoint] = data;
  setTimeout(() => delete cache[endpoint], ttl);
}

async function fetchExercises(endpoint) {
  if (cache[endpoint]) {
    console.log("Using cached data for:", endpoint);
    return cache[endpoint];
  }

  try {
    const response = await exerciseAPI.get(`/exercises${endpoint}`);
    setCache(endpoint, response.data);
    console.log("request sent : ", endpoint);
    return response.data;
  } catch (err) {
    console.error("Error fetching exercises:", err.message);
    return [];
  }
}

exports.getExercises = async (req, res) => {
  try {
    const { q, mood } = req.query;
    let exercises = [];
    const query = q?.trim().toLowerCase() || "";
    const moodValue = mood?.trim().toLowerCase() || "";

    console.log(query, moodValue);

    if (query && /^[a-zA-Z\s]+$/.test(query)) {
      let byName = await fetchExercises(`/name/${query}`);

      exercises = [...byName];

      let uniqueTracks = {};
      exercises.forEach((track) => {
        uniqueTracks[track.id] = track;
      });

      exercises = Object.values(uniqueTracks);
    } else if (moodMap[moodValue]) {
      const categories = moodMap[moodValue] || moodMap["happy"];
      let moodExercises = [];

      for (const cat of categories.slice(0, 2)) {
        const data = await fetchExercises(`/target/${encodeURIComponent(cat)}`);
        if (data && data.length > 0) {
          moodExercises = moodExercises.concat(data);
          break;
        }
      }

      exercises = moodExercises;
    } else {
      const categories = moodMap["happy"];
      let moodExercises = [];

      for (const cat of categories.slice(0, 2)) {
        const data = await fetchExercises(`/target/${encodeURIComponent(cat)}`);
        if (data && data.length > 0) {
          moodExercises = moodExercises.concat(data);
          break;
        }
      }

      exercises = moodExercises;
    }

    if (exercises.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Data not found",
      });
    }

    res.status(200).json(exercises);
  } catch (err) {
    console.error("Error fetching exercises:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch exercises" });
  }
};

exports.getImage = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Missing exercise ID.",
    });
  }

  try {
    const imageUrl = `/image?exerciseId=${id}&resolution=360`;

    const imageResponse = await exerciseAPI.get(imageUrl, {
      responseType: "stream",
    });

    res.set("Content-Type", "image/gif");
    res.set("Cache-Control", "public, max-age=3600");

    imageResponse.data.pipe(res);
  } catch (error) {
    console.error("Error in image proxy:", error.message);
    res.status(500).send("Failed to fetch image.");
  }
};
