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

// Helper function to fetch exercises from external API
const fetchExercises = async (endpoint) => {
  try {
    const response = await exerciseAPI.get(`/exercises${endpoint}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching exercises:", err.message);
    return [];
  }
};

// Helper function to get exercises based on categories
const getExercisesByCategories = async (categories, userId) => {
  try {
    const promises = categories.map(async (cat) => {
      return await Exercise.searchBykeywords(userId, Exercise.normalize(cat));
    });

    const results = await Promise.all(promises);
    const allExercises = results.flat();
    const exercises = await Exercise.sortExercises(userId, allExercises);
    return exercises;
  } catch (err) {
    console.error("Error fetching exercises:", err.message);
    return [];
  }
};

// Helper function to get unique exercises based on external_id
const getUniqueExercises = (exercises) => {
  const uniqueExercises = Object.values(
    exercises.reduce((acc, ex) => {
      acc[ex.external_id] = ex;
      return acc;
    }, {}),
  );
  return uniqueExercises;
};

exports.getExercises = async (req, res) => {
  try {
    const query = Exercise.normalize(req.query.q);
    const moodValue = Exercise.normalize(req.query.mood);
    const userId = req.id;

    let exercises = [];

    Exercise.updateHistory(userId, query, moodValue).catch((err) =>
      console.error("History update failed:", err),
    );

    exercises = query
      ? await Exercise.searchBykeywords(userId, query, moodValue)
      : [];
    if (exercises.length !== 0) {
      exercises = await Exercise.sortExercises(userId, exercises);
    }

    if (!query && moodValue) {
      const categories = moodMap[moodValue];
      let moodExercises = await getExercisesByCategories(categories, userId);
      exercises = [...moodExercises];
    }

    if (!query && !moodValue) {
      const categories = moodMap["happy"];
      let moodExercises = await getExercisesByCategories(categories, userId);
      exercises = [...moodExercises];
    }

    if (!exercises || exercises.length === 0) {
      if (query) {
        const result = await fetchExercises(`/name/${query}`);
        const exerciseData = await Exercise.storeExercises(result);
        const sortedExercises = await Exercise.sortExercises(
          userId,
          exerciseData,
        );

        exercises = [...sortedExercises];
      } else {
        const categories = moodMap[moodValue] || moodMap["happy"];
        let exerciseData = [];

        const promises = categories.map((cat) =>
          fetchExercises(`/target/${encodeURIComponent(cat)}`),
        );
        const results = await Promise.all(promises);

        const allExercises = results.flat();
        const uniqueExercises = getUniqueExercises(allExercises);
        exerciseData = await Exercise.storeExercises(uniqueExercises);
        exercises = [...exerciseData];
      }
    }

    if (!exercises || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Data not found",
      });
    }

    const uniqueExercises = getUniqueExercises(exercises);

    res.status(200).json(uniqueExercises);
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

    const uploadPromise = supabase.storage
      .from("moodMix")
      .upload(fileName, fileBuffer, {
        contentType: "image/gif",
      });

    publicUrl = supabase.storage.from("moodMix").getPublicUrl(fileName)
      .data.publicUrl;

    uploadPromise.then(({ data, error }) => {
      if (!error) Exercise.updateGifUrl(id, publicUrl);
    });

    res.status(200).json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Error in image proxy:", error.message);
    res.status(500).send("Failed to fetch image.");
  }
};
