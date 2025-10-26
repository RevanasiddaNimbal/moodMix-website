const pool = require("../config/db");

const videos = {
  updateHistory: async (query = "", moodValue = "") => {
    console.log("Updating video history with:", query, moodValue);
    try {
      if (!query && !moodValue) return;
      const result = await pool.query(
        "INSERT INTO video_history(query_text ,mood, hits, last_hit_at) VALUES ($1 , $2, 1,NOW()) ON CONFLICT (query_text , mood) DO UPDATE SET hits = video_history.hits + 1, last_hit_at = NOW() RETURNING *",
        [query, moodValue]
      );
      return result.rows[0];
    } catch (err) {
      console.log("Error updating video history:", err.message);
      return {
        error: true,
      };
    }
  },

  storeVideos: async (videoArray = []) => {
    try {
      if (!videoArray || videoArray.length === 0) return [];
      const storedVideos = [];

      for (const video of videoArray) {
        const {
          id: { videoId },
          snippet,
        } = video;

        if (!videoId || !snippet) continue;

        const {
          title,
          description,
          channelTitle,
          publishedAt,
          thumbnails,
          liveBroadcastContent,
        } = snippet;

        const result = await pool.query(
          `
          INSERT INTO videos (
            video_id, title, description, channel_title, published_at,
            thumbnail_default, thumbnail_medium, live_broadcast_content
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (video_id)
          DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            channel_title = EXCLUDED.channel_title,
            published_at = EXCLUDED.published_at,
            thumbnail_default = EXCLUDED.thumbnail_default,
            thumbnail_medium = EXCLUDED.thumbnail_medium,
            live_broadcast_content = EXCLUDED.live_broadcast_content
          RETURNING *;
          `,
          [
            videoId,
            title,
            description,
            channelTitle,
            publishedAt,
            thumbnails?.default?.url,
            thumbnails?.medium?.url,
            liveBroadcastContent,
          ]
        );
        if (result.rows.length > 0) {
          storedVideos.push(result.rows[0]);
        }
      }
      return storedVideos;
    } catch (err) {
      console.log("Error storing videos:", err.message);
      return [];
    }
  },

  searchBykeywords: async (query, moodValue) => {
    try {
      let allvideos = [];

      const result = await pool.query(
        `
          SELECT 
           v.*,
           COALESCE(vh.hits, 0) AS search_hits,
           vh.mood AS matched_mood
         FROM videos v
         LEFT JOIN video_history vh
           ON LOWER(vh.query_text) = LOWER($1)
           AND ($2::VARCHAR IS NULL OR vh.mood = $2::VARCHAR)
         WHERE (
           v.title ILIKE '%' || $1 || '%'
           OR v.description ILIKE '%' || $1 || '%'
           OR v.channel_title ILIKE '%' || $1 || '%'
         )
         ORDER BY 
           COALESCE(vh.hits, 0) DESC,
           v.published_at DESC
         LIMIT 50;
 `,
        [query.trim().toLowerCase(), moodValue?.trim() || null]
      );
      if (result.rows.length > 0) {
        allvideos.push(...result.rows);
      }

      const uniqueVideos = {};
      for (const video of allvideos) {
        uniqueVideos[video.id] = video;
      }
      const finalResults = Object.values(uniqueVideos).sort((a, b) => {
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
  sortVideos: async (videos = []) => {
    try {
      const history = await pool.query(
        `SELECT query_text, mood, hits FROM video_history ORDER BY hits DESC, last_hit_at DESC LIMIT 30;`
      );
      const historyQuery = history.rows.map((r) => r.query_text);

      let his_videos = [];
      for (const query of historyQuery) {
        const result = await pool.query(
          `
          SELECT 
            v.*, 
            COALESCE(vh.hits, 0) AS search_hits
          FROM videos v
          LEFT JOIN video_history vh
            ON LOWER(v.title) LIKE '%' || LOWER(vh.query_text) || '%'
          WHERE LOWER(v.title) LIKE '%' || $1 || '%'
          ORDER BY vh.hits DESC, v.published_at DESC
          LIMIT 100;
          `,
          [query]
        );
        if (result.rows.length > 0) {
          his_videos.push(...result.rows);
        }
      }
      let allResults = [...his_videos, ...videos];

      if (allResults.length === 0) {
        console.log("fetching fallback videos");
        const fallback = await pool.query(
          `SELECT * FROM videos ORDER BY updated_at DESC LIMIT 100`
        );
        allResults = fallback.rows;
      }
      const uniqueVideos = {};
      for (const video of allResults) {
        uniqueVideos[video.id] = video;
      }
      const finalResults = Object.values(uniqueVideos).sort((a, b) => {
        const dateA = new Date(a.updated_at || a.published_at);
        const dateB = new Date(b.updated_at || b.published_at);

        if (dateB - dateA !== 0) return dateB - dateA;

        return (b.search_hits || 0) - (a.search_hits || 0);
      });
      return finalResults;
    } catch (err) {
      console.log("sorting error:", err.message);
    }
  },
};

module.exports = videos;
