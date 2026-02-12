const pool = require("../config/db");

const videos = {
  updateHistory: async (userId, query = "", moodValue = "") => {
    try {
      if (!query && !moodValue) return null;

      const result = await pool.query(
        `
        INSERT INTO video_history (user_id, query_text, mood, hits, last_hit_at)
        VALUES ($1, $2, $3, 1, NOW())
        ON CONFLICT (user_id, query_text, mood)
        DO UPDATE SET
          hits = video_history.hits + 1,
          last_hit_at = NOW()
        RETURNING *
        `,
        [userId, query.toLowerCase(), moodValue],
      );

      return result.rows[0];
    } catch (err) {
      console.error("updateHistory error:", err.message);
      return null;
    }
  },

  storeVideos: async (videoArray = []) => {
    try {
      if (!videoArray || videoArray.length === 0) return [];

      const promises = videoArray.map(async (video) => {
        const {
          id: { videoId },
          snippet,
        } = video;

        if (!videoId || !snippet) return null;

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
            live_broadcast_content = EXCLUDED.live_broadcast_content,
            updated_at = NOW()
          RETURNING *
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
          ],
        );

        return result.rows[0] ?? null;
      });

      const results = await Promise.all(promises);
      return results.filter(Boolean);
    } catch (err) {
      console.error("storeVideos error:", err.message);
      return [];
    }
  },

  searchBykeywords: async (userId, query, moodValue) => {
    try {
      if (!query) return [];

      const result = await pool.query(
        `
        SELECT
          v.*,
          COALESCE(vh.hits, 0) AS search_hits,
          vh.mood AS matched_mood,
          (
            COALESCE(vh.hits, 0) * 5
            + CASE WHEN vh.mood = $3 THEN 3 ELSE 0 END
            + CASE WHEN v.published_at > NOW() - INTERVAL '7 days' THEN 2 ELSE 0 END
            + CASE WHEN LOWER(v.title) ILIKE '%' || $2 || '%' THEN 4 ELSE 0 END
            + CASE WHEN LOWER(v.channel_title) ILIKE '%' || $2 || '%' THEN 2 ELSE 0 END
            + CASE WHEN LOWER(v.description) ILIKE '%' || $2 || '%' THEN 1 ELSE 0 END
          ) AS rank_score
        FROM videos v
        LEFT JOIN video_history vh
          ON vh.user_id = $1
          AND LOWER(vh.query_text) = $2
          AND ($3::VARCHAR IS NULL OR vh.mood = $3::VARCHAR)
        WHERE (
          v.title ILIKE '%' || $2 || '%'
          OR v.description ILIKE '%' || $2 || '%'
          OR v.channel_title ILIKE '%' || $2 || '%'
        )
        ORDER BY rank_score DESC, v.published_at DESC
        LIMIT 50
        `,
        [userId, query.trim().toLowerCase(), moodValue?.trim() || null],
      );

      return result.rows;
    } catch (err) {
      console.error("searchBykeywords error:", err.message);
      return [];
    }
  },

  sortVideos: async (userId, mood = "neutral", excludeIds = [], limit = 50) => {
    try {
      const result = await pool.query(
        `
      SELECT
        v.*,
        COALESCE(vh.hits, 0) AS user_hits,
        (
          COALESCE(vh.hits, 0) * 5
          + CASE WHEN vh.mood = $2 THEN 3 ELSE 0 END
          + CASE WHEN v.updated_at > NOW() - INTERVAL '1 hour' THEN 20 ELSE 0 END
          + CASE WHEN v.updated_at > NOW() - INTERVAL '24 hours' THEN 10 ELSE 0 END
          + CASE WHEN v.published_at > NOW() - INTERVAL '7 days' THEN 4 ELSE 0 END
          + CASE WHEN v.published_at > NOW() - INTERVAL '30 days' THEN 2 ELSE 0 END
          + random()
        ) AS rank_score
      FROM videos v
      LEFT JOIN video_history vh
        ON vh.user_id = $1
        AND (
          LOWER(v.title) LIKE '%' || LOWER(vh.query_text) || '%'
          OR LOWER(v.description) LIKE '%' || LOWER(vh.query_text) || '%'
          OR LOWER(v.channel_title) LIKE '%' || LOWER(vh.query_text) || '%'
        )
      WHERE
        NOT v.video_id = ANY($3)
      ORDER BY rank_score DESC
      LIMIT $4
      `,
        [userId, mood, excludeIds, limit],
      );

      if (result.rows.length > 0) return result.rows;

      const fallback = await pool.query(
        `
      SELECT * FROM videos
      WHERE NOT video_id = ANY($1)
      ORDER BY updated_at DESC, published_at DESC
      LIMIT $2
      `,
        [excludeIds, limit],
      );

      return fallback.rows;
    } catch (err) {
      console.error("sortVideos error:", err.message);
      return [];
    }
  },
};

module.exports = videos;
