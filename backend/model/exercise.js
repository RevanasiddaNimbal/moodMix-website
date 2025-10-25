const pool = require("../config/db");

const exercises = {
  normalize: (str = "") => {
    return String(str || "")
      .trim()
      .toLowerCase();
  },

  updateHistory: async (query, moodValue) => {
    try {
      if (!query && !moodValue) return;

      const result = await pool.query(
        "INSERT INTO search_history(query_text , mood, hits,last_hit_at) VALUES ($1,$2, 1,NOW()) ON CONFLICT (query_text,mood) DO UPDATE SET hits = search_history.hits + 1, last_hit_at = NOW() RETURNING *",
        [query, moodValue]
      );
      return result.rows[0];
    } catch (err) {
      console.log("Error updating history:", err.message);
      return {
        error: true,
      };
    }
  },

  storeExercises: async (exercisesArray = []) => {
    if (!exercisesArray || exercisesArray.length === 0) return [];
    const storedExercises = [];

    for (const exercise of exercisesArray) {
      try {
        const {
          id: external_id,
          name,
          bodyPart,
          target,
          equipment,
          instructions,
          category,
        } = exercise;

        const nameNorm = exercises.normalize(name);
        const targetNorm = exercises.normalize(target);
        const bodyPartNorm = exercises.normalize(bodyPart);
        const equipmentNorm = exercises.normalize(equipment);

        const result = await pool.query(
          `INSERT INTO exercises 
            (external_id, name, body_part, target, equipment,  instructions, category)
           VALUES ($1, $2, $3, $4, $5,  $6::TEXT[], $7)
           ON CONFLICT (name) DO NOTHING
           RETURNING *`,
          [
            external_id || null,
            nameNorm,
            bodyPartNorm,
            targetNorm,
            equipmentNorm,
            instructions ? `{${instructions.join(",")}}` : null,
            category || null,
          ]
        );
        if (result.rows.length > 0) {
          storedExercises.push(result.rows[0]);
        }
        return storedExercises;
      } catch (err) {
        console.log("Error storing exercise:", err.message);
      }
    }
  },

  searchBykeywords: async (query = "", moodValue = null) => {
    try {
      if (!query && !moodValue) return [];

      const keywords =
        query.trim() !== ""
          ? query
              .split(" ")
              .map((k) => k.trim())
              .filter(Boolean)
          : [moodValue];

      let allResults = [];

      for (const word of keywords) {
        const result = await pool.query(
          `
        SELECT 
          e.*, 
          COALESCE(sh.hits, 0) AS search_hits,
          sh.mood AS matched_mood
        FROM exercises e
        LEFT JOIN search_history sh
          ON (LOWER(sh.query_text) = LOWER($1)
              OR LOWER(e.name) LIKE '%' || LOWER(sh.query_text) || '%'
              OR LOWER(e.target) LIKE '%' || LOWER(sh.query_text) || '%')
         AND ($2::VARCHAR IS NULL OR sh.mood = $2::VARCHAR)
        WHERE 
          (e.name ILIKE '%' || $1 || '%' 
          OR e.target ILIKE '%' || $1 || '%' 
          OR e.equipment ILIKE '%' || $1 || '%' 
          OR e.body_part ILIKE '%' || $1 || '%')
        ORDER BY 
          sh.hits DESC, 
          e.name ASC
        LIMIT 50
        `,
          [word, moodValue]
        );
        if (result.rows.length > 0) {
          allResults = allResults.concat(result.rows);
        }
      }
      const uniqueExercises = {};
      for (const ex of allResults) {
        uniqueExercises[ex.id] = ex;
      }
      const finalResults = Object.values(uniqueExercises).sort((a, b) => {
        if (b.search_hits !== a.search_hits)
          return b.search_hits - a.search_hits;
        if (a.matched_mood === moodValue && b.matched_mood !== moodValue)
          return -1;
        if (b.matched_mood === moodValue && a.matched_mood !== moodValue)
          return 1;
        return a.name.localeCompare(b.name);
      });

      return finalResults;
    } catch (err) {
      console.log("Error searching exercises:", err.message);
      return {
        error: true,
      };
    }
  },

  sortExercises: async (exercises = []) => {
    try {
      const historyRes = await pool.query(
        `SELECT query_text, mood, hits 
       FROM search_history 
       ORDER BY hits DESC, last_hit_at DESC 
       LIMIT 20;`
      );

      const historyQueries = historyRes.rows.map((r) => r.query_text);

      let his_exercises = [];
      for (const query of historyQueries) {
        const result = await pool.query(
          `SELECT e.*, COALESCE(sh.hits, 0) AS search_hits
       FROM exercises e
       LEFT JOIN search_history sh
         ON LOWER(e.name) LIKE '%' || LOWER(sh.query_text) || '%'
       WHERE LOWER(e.name) LIKE '%' || LOWER($1) || '%'
       ORDER BY sh.hits DESC, e.updated_at DESC
       LIMIT 50`,
          [query]
        );
        if (result.rows.length > 0) {
          his_exercises.push(...result.rows);
        }
      }

      let allResults = [...his_exercises, ...exercises];

      if (allResults.length === 0) {
        const fallback = await pool.query(
          `SELECT * FROM exercises ORDER BY updated_at DESC LIMIT 100;`
        );
        allResults = fallback.rows;
      }
      const uniqueExercises = {};
      for (const exercise of allResults) {
        uniqueExercises[exercise.id] = exercise;
      }

      return Object.values(uniqueExercises);
    } catch (err) {
      console.log("Error fetching updated exercises:", err.message);
      return exercises || [];
    }
  },

  updateGifUrl: async (Id, gifUrl) => {
    try {
      if (!Id || !gifUrl) return null;

      const result = await pool.query(
        `UPDATE exercises SET gif_url = $1 WHERE id = $2 RETURNING *`,
        [gifUrl, Id]
      );

      if (result.rows.length === 0) return false;

      return result.rows[0].gif_url;
    } catch (err) {
      console.log("Error updating gif url:", err.message);
      return false;
    }
  },
  getGifUrl: async (exerciseId) => {
    try {
      if (!exerciseId) return null;

      const result = await pool.query(
        `SELECT gif_url, external_id FROM exercises WHERE id = $1`,
        [exerciseId]
      );

      if (result.rows.length === 0) return null;

      return result.rows[0];
    } catch (err) {
      console.log("Error fetching gif url:", err.message);
      return null;
    }
  },
};

module.exports = exercises;
