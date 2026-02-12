const { musicAPI } = require("../utils/api");
const Musics = require("../model/music");

const moodMusicMap = {
  happy: ["uplifting instrumental music"],
  sad: ["emotional instrumental music"],
  calm: ["peaceful instrumental music"],
  angry: ["stress relief instrumental music"],
  excited: ["energetic instrumental music"],
};

const fetchMusicsByQuery = async (query) => {
  try {
    const res = await musicAPI.get("/search/tracks", {
      params: {
        q: query,
        client_id: process.env.CLIENT_ID,
        limit: 30,
      },
    });
    return res.data.collection || [];
  } catch (err) {
    console.error("Error fetching musics:", err.message);
    return [];
  }
};

exports.getMusics = async (req, res, next) => {
  try {
    const userId = req.id;
    const { q, mood = "calm" } = req.body;

    await Musics.updateHistory(userId, q ? q : mood, mood);

    let newSongsList = [];
    let oldSongs = [];

    if (q) {
      const fresh = await fetchMusicsByQuery(q);
      const stored = await Musics.storeMusics(fresh);
      const newSongs = stored.map((song) => song.music_id);
      oldSongs = await Musics.getPersonalizedFeed(userId, mood, newSongs, 75);
      newSongsList = await Promise.all(
        newSongs.map((id) => Musics.getTrackById(id)),
      );
    } else {
      const moodQueries = moodMusicMap[mood] || moodMusicMap["calm"];
      const promises = moodQueries.map(async (query) => {
        const fresh = await fetchMusicsByQuery(query);
        const stored = await Musics.storeMusics(fresh);
        return stored;
      });
      const results = await Promise.all(promises);
      newSongsList = results.flat().slice(0, 30);
      const excludeIds = newSongsList.map((s) => s.music_id);
      oldSongs = await Musics.getPersonalizedFeed(userId, mood, excludeIds, 75);
    }

    const feed = [...newSongsList, ...oldSongs];

    const uniqueFeed = [...new Map(feed.map((m) => [m.music_id, m])).values()];

    if (!uniqueFeed || uniqueFeed.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No musics found. Please try again later.",
      });
    }
    res.status(200).json({
      success: true,
      data: uniqueFeed,
    });
  } catch (err) {
    console.error(err.stack);
    next(err);
  }
};

exports.getTrackInfo = async (req, res, next) => {
  try {
    const id = req.params.id;
    let track = await Musics.getTrackById(id);

    const scRes = await musicAPI.get(`/tracks/${id}`, {
      params: { client_id: process.env.CLIENT_ID },
    });

    if (!track) {
      const stored = await Musics.storeMusics([scRes.data]);
      track = stored[0];
    }

    const progressive = scRes.data.media.transcodings.find(
      (t) => t.format.protocol === "progressive",
    );

    const transRes = await musicAPI.get(progressive.url, {
      params: { client_id: process.env.CLIENT_ID },
    });

    await Musics.updateProgressiveUrl(id, transRes.data.url);

    res.json({
      success: true,
      data: {
        title: track.title,
        artist: track.artist_name || track.username,
        artwork: track.artwork_url,
        duration: track.duration,
        progressiveUrl: transRes.data.url,
      },
    });
  } catch (err) {
    next(err);
  }
};
