const pool = require("../config/db");
const { searchBykeywords } = require("./video");

const musics = {
  updateHistory: async (query = "", moodValue = "") => {
    try {
      if (!query && !moodValue) return;
      const result = await pool.query(
        "INSERT INTO musics_history(query_text , mood, hits, last_hit_at) VALUES ($1, $2, 1, NOW()) ON CONFLICT (query_text , mood) DO UPDATE SET hits = musics_history.hits + 1, last_hit_at = NOW() RETURNING *",
        [query, moodValue]
      );
      return result.rows[0];
    } catch (err) {
      console.log("Error updating music history:", err.message);
      return false;
    }
  },

  storeMusics: async (musicsArray = []) => {
    try {
      if (!musicsArray || musicsArray.length === 0) return [];
      const storedMusics = [];
      for (const music of musicsArray) {
        const {
          id: music_id,
          title,
          user,
          artwork_url,
          duration,
          stream_url,
          genre,
          streamable = true,
          permalink_url,
        } = music;

        const username = user?.username || user?.full_name || null;
        const artist_name = user?.full_name || user?.username || null;
        const artist_avatar = user?.avatar_url || null;

        const result = await pool.query(
          `INSERT INTO musics 
          (music_id, title, username, artwork_url, duration, stream_url,
           artist_name, artist_avatar, genre, streamable, permalink_url, fetched_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (music_id) DO UPDATE SET
           title = EXCLUDED.title,
           username = EXCLUDED.username,
           artwork_url = EXCLUDED.artwork_url,
           duration = EXCLUDED.duration,
           stream_url = EXCLUDED.stream_url,
           artist_name = EXCLUDED.artist_name,
           artist_avatar = EXCLUDED.artist_avatar,
           genre = EXCLUDED.genre,
           streamable = EXCLUDED.streamable,
           permalink_url = EXCLUDED.permalink_url,
           fetched_at = NOW()
         RETURNING *`,
          [
            music_id,
            title,
            username,
            artwork_url,
            duration,
            stream_url,
            artist_name,
            artist_avatar,
            genre,
            streamable,
            permalink_url,
          ]
        );
        if (result.rows[0]) {
          storedMusics.push(result.rows[0]);
        }
      }
      return storedMusics;
    } catch (err) {
      console.log("Error storing musics:", err.message);
      return [];
    }
  },

  searchBykeywords: async (query, moodValue) => {
    try {
      if (!query && !moodValue) return [];
      let allmusics = [];
      const result = await pool.query(
        `
             SELECT 
               m.*,
               COALESCE(mh.hits, 0) AS search_hits,
               mh.mood AS matched_mood
             FROM musics m
             LEFT JOIN musics_history mh
               ON LOWER(mh.query_text) = LOWER($1)
               AND ($2::VARCHAR IS NULL OR mh.mood = $2::VARCHAR)
             WHERE (
               m.title ILIKE '%' || $1 || '%'
               OR m.username ILIKE '%' || $1 || '%'
             )
             ORDER BY 
               COALESCE(mh.hits, 0) DESC,
               m.updated_at DESC
             LIMIT 50;
             `,
        [query.trim().toLowerCase(), moodValue?.trim() || null]
      );
      if (result.rows.length > 0) {
        allmusics = result.rows;
      }
      const uniqueMusics = {};
      for (const music of allmusics) {
        uniqueMusics[music.id] = music;
      }

      const finalResults = Object.values(uniqueMusics).sort((a, b) => {
        if (b.search_hits !== a.search_hits)
          return b.search_hits - a.search_hits;
        if (a.matched_mood === moodValue && b.matched_mood !== moodValue)
          return -1;
        if (b.matched_mood === moodValue && a.matched_mood !== moodValue)
          return 1;
        return a.title.localeCompare(b.title);
      });
      return finalResults;
    } catch (err) {
      console.log("searching error: ", err.message);
      return [];
    }
  },
  sortMusics: async (musicsArray = []) => {
    try {
      const historyRes = await pool.query(
        "SELECT query_text, mood, hits FROM musics_history ORDER BY hits DESC"
      );
      const historyQueries = historyRes.rows;

      let his_musics = [];
      for (const query of historyQueries) {
        const result = await pool.query(
          ` 
          SELECT 
            m.*, 
            COALESCE(mh.hits, 0) AS search_hits
          FROM musics m
          LEFT JOIN musics_history mh
            ON LOWER(m.title) LIKE '%' || LOWER(mh.query_text) || '%'
          WHERE LOWER(m.title) LIKE '%' || $1 || '%'
          ORDER BY mh.hits DESC, m.updated_at DESC
          LIMIT 100;
          `,
          [query]
        );
        if (result.rows.length > 0) {
          his_musics = his_musics.concat(result.rows);
        }
      }

      let allResults = [...his_musics, ...musicsArray];
      const uniqueMusics = {};
      for (const music of allResults) {
        uniqueMusics[music.id] = music;
      }

      const finalResults = Object.values(uniqueMusics).sort((a, b) => {
        const dateA = new Date(a.updated_at);
        const dateB = new Date(b.updated_at);

        if (dateB - dateA !== 0) return dateB - dateA;

        return (b.search_hits || 0) - (a.search_hits || 0);
      });
      return finalResults;
    } catch (err) {
      console.log("Error sorting musics:", err.message);
      return musicsArray;
    }
  },

  getTrackById: async (musicId) => {
    try {
      if (!musicId) return null;
      const result = await pool.query(
        `SELECT * FROM musics WHERE music_id = $1`,
        [musicId]
      );
      return result.rows[0];
    } catch (err) {
      console.log("Error fetching track by ID:", err.message);
      return null;
    }
  },

  updateProgressiveUrl: async (musicId, progressiveUrl) => {
    try {
      if (!musicId || !progressiveUrl) return false;
      const result = await pool.query(
        `UPDATE musics SET progressive_url = $1 WHERE music_id = $2 RETURNING *`,
        [progressiveUrl, musicId]
      );
      return result.rows[0].progressive_url;
    } catch (err) {
      console.log("Error updating progressive url:", err.message);
      return false;
    }
  },
};

module.exports = musics;
