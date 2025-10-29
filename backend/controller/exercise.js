const { exerciseAPI } = require("../utils/api");
const Exercise = require("../model/exercise");
const supabase = require("../config/storage");

const moodMap = {
  happy: ["calves", "shoulders", "cable"],
  sad: ["abs", "lower legs", "barbell"],
  calm: ["serratus anterior", "chest", "shoulders"],
  angry: ["delts", "triceps"],
  excited: ["quads", "pectorals", "lats"],
};

const fetchExercises = async (endpoint) => {
  try {
    const response = await exerciseAPI.get(`/exercises${endpoint}`);
    console.log("request sent : ", endpoint);
    return response.data;
  } catch (err) {
    console.error("Error fetching exercises:", err.message);
    return [];
  }
};

exports.getExercises = async (req, res) => {
  try {
    const query = Exercise.normalize(req.query.q);
    const moodValue = Exercise.normalize(req.query.mood);

    let exercises = [];

    await Exercise.updateHistory(query, moodValue);

    exercises = query ? await Exercise.searchBykeywords(query) : [];
    if (exercises.length !== 0) {
      exercises = await Exercise.sortExercises(exercises);
    }

    if (!query && moodValue) {
      const categories = moodMap[moodValue];
      let moodExercises = [];

      for (const cat of categories) {
        const data = await Exercise.searchBykeywords(Exercise.normalize(cat));
        if (data && data.length > 0) {
          moodExercises = moodExercises.concat(data);
        }
      }

      exercises = [...moodExercises];
    }

    if (!query && !moodValue) {
      const categories = moodMap["happy"];
      let moodExercises = [];

      for (const cat of categories) {
        const data = await Exercise.searchBykeywords(Exercise.normalize(cat));
        if (data && data.length > 0) {
          moodExercises = moodExercises.concat(data);
        }
      }
      exercises = [...moodExercises];
    }

    if (!exercises || exercises.length === 0) {
      if (query) {
        const result = await fetchExercises(`/name/${query}`);
        const exerciseData = await Exercise.storeExercises(result);
        const sortedExercises = await Exercise.sortExercises(exerciseData);

        exercises = [...sortedExercises];
      } else {
        const categories = moodMap[moodValue] || moodMap["happy"];
        let exerciseData = [];

        for (const cat of categories.slice(0, 2)) {
          const result = await fetchExercises(
            `/target/${encodeURIComponent(cat)}`
          );

          if (result && result.length > 0) {
            exerciseData = await Exercise.storeExercises(result);
            const sortedData = await Exercise.sortExercises(exerciseData);

            exerciseData = [...exerciseData, ...sortedData];
          }
        }
        exercises = [...exerciseData];
      }
    }

    if (!exercises || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Data not found",
      });
    }

    const uniqueExercises = {};
    for (const exercise of exercises) {
      uniqueExercises[exercise.external_id] = exercise;
    }

    res.status(200).json(Object.values(uniqueExercises));
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
    const result = await Exercise.getGifUrl(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Exercise not found.",
      });
    }
    let publicUrl = null;
    if (result.gif_url) {
      publicUrl = result.gif_url;
      return res.status(200).json({ success: true, url: publicUrl });
    }

    const external_id = result?.external_id;
    const imageUrl = `/image?exerciseId=${external_id}&resolution=360`;
    const imageResponse = await exerciseAPI.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const fileBuffer = Buffer.from(imageResponse.data);
    const fileName = `exercise_${id}-${Date.now()}.gif`;

    const { data, error } = await supabase.storage
      .from("moodMix")
      .upload(fileName, fileBuffer, {
        contentType: "image/gif",
      });

    if (error) {
      console.log("Supabase upload error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to upload image.",
      });
    }
    const { data: urlData } = supabase.storage
      .from("moodMix")
      .getPublicUrl(fileName);

    publicUrl = await Exercise.updateGifUrl(id, urlData.publicUrl);
    res.status(200).json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Error in image proxy:", error.message);
    res.status(500).send("Failed to fetch image.");
  }
};
