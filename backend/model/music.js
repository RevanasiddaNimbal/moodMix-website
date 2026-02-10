const pool = require("../config/db");

const Musics = {
  updateHistory: async (userId, query = "", mood = "neutral") => {
    try {
      if (!query && !mood) return null;

      const res = await pool.query(
        `
        INSERT INTO musics_history (user_id, query_text, mood, hits, last_hit_at)
        VALUES ($1, $2, $3, 1, NOW())
        ON CONFLICT (user_id, query_text, mood)
        DO UPDATE SET
          hits = musics_history.hits + 1,
          last_hit_at = NOW()
        RETURNING *
        `,
        [userId, query.toLowerCase(), mood],
      );

      return res.rows[0];
    } catch (err) {
      console.error("updateHistory error:", err.message);
      return null;
    }
  },

  storeMusics: async (musics = []) => {
    try {
      if (!musics.length) return [];

      let stored = [];

      const promises = musics.map(async (m) => {
        const res = await pool.query(
          `
        INSERT INTO musics (
          music_id, title, username, artwork_url, duration, stream_url,
          artist_name, artist_avatar, genre, streamable, permalink_url, fetched_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
        ON CONFLICT (music_id) DO UPDATE SET
          title = EXCLUDED.title,
          artwork_url = EXCLUDED.artwork_url,
          genre = EXCLUDED.genre,
          fetched_at = NOW()
        RETURNING *
        `,
          [
            m.id,
            m.title,
            m.user?.username ?? null,
            m.artwork_url,
            m.duration,
            m.stream_url,
            m.user?.full_name ?? null,
            m.user?.avatar_url ?? null,
            m.genre,
            m.streamable ?? true,
            m.permalink_url,
          ],
        );
        return res.rows[0];
      });
      const results = await Promise.all(promises);
      stored = results.flat();
      return stored;
    } catch (err) {
      console.error("storeMusics error:", err.message);
      return [];
    }
  },

  getPersonalizedFeed: async (
    userId,
    mood = "neutral",
    excludeIds = [],
    limit = 50,
  ) => {
    try {
      const res = await pool.query(
        `
      SELECT
        m.*,
        COALESCE(mh.hits,0) AS user_hits,
        (
          COALESCE(mh.hits,0)*5
          + CASE WHEN mh.mood = $2 THEN 3 ELSE 0 END
          + CASE WHEN m.fetched_at > NOW() - INTERVAL '7 days' THEN 2 ELSE 0 END
          + random()
        ) AS rank_score
      FROM musics m
      LEFT JOIN musics_history mh
        ON mh.user_id = $1
        AND (
          LOWER(m.title) LIKE '%' || LOWER(mh.query_text) || '%'
          OR LOWER(m.artist_name) LIKE '%' || LOWER(mh.query_text) || '%'
        )
      WHERE NOT m.music_id = ANY($3)
      ORDER BY rank_score DESC
      LIMIT $4
      `,
        [userId, mood, excludeIds, limit],
      );

      return res.rows;
    } catch (err) {
      console.error("getPersonalizedFeed error:", err.message);
      return [];
    }
  },

  getTrackById: async (id) => {
    try {
      const res = await pool.query(`SELECT * FROM musics WHERE music_id = $1`, [
        id,
      ]);
      return res.rows[0] || null;
    } catch (err) {
      console.error("getTrackById error:", err.message);
      return null;
    }
  },

  updateProgressiveUrl: async (id, url) => {
    try {
      await pool.query(
        `UPDATE musics SET progressive_url = $1 WHERE music_id = $2`,
        [url, id],
      );
    } catch (err) {
      console.error("updateProgressiveUrl error:", err.message);
    }
  },
};

module.exports = Musics;
