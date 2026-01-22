const { musicAPI } = require("../utils/api");
const Musics = require("../model/music");

const moodMusicMap = {
  happy: [
    "positive inspirational music full length",
    "uplifting multilingual songs compilation full album",
    "feel good instrumental background music full",
    "light classical music for positive mood full length",
    "motivational music playlist full session",
  ],

  sad: [
    "emotional instrumental music full album",
    "soft melody songs compilation full length",
    "reflective music for deep thinking full session",
    "emotional classical music full length",
    "calm expressive instrumental playlist full",
  ],

  calm: [
    "peaceful instrumental music full album",
    "relaxing classical flute and piano full length",
    "meditation and mindfulness music full session",
    "nature ambient music for calmness full",
    "soft background music for relaxation full length",
  ],

  angry: [
    "stress relief instrumental music full album",
    "calming background music for emotional balance full",
    "focus and concentration music full session",
    "motivational instrumental music full length",
    "mental clarity music playlist full",
  ],

  excited: [
    "energetic instrumental music full album",
    "motivational background music full session",
    "uplifting instrumental playlist full length",
    "positive energy music compilation full",
    "inspirational instrumental music full program",
  ],
};

const fetchMusics = async (query) => {
  try {
    if (!query) return [];
    const response = await musicAPI.get("/search/tracks", {
      params: {
        q: query,
        client_id: process.env.CLIENT_ID,
        limit: 30,
      },
    });
    return response.data.collection;
  } catch (err) {
    console.log("Error fetching musics:", err.message);
    return [];
  }
};

exports.getMusics = async (req, res, next) => {
  try {
    const query = req.body?.q?.trim();
    const mood = req.body?.mood;

    await Musics.updateHistory(query, mood);

    let musicData = query ? await Musics.searchBykeywords(query) : [];
    if (musicData.length > 0) {
      musicData = await Musics.sortMusics(musicData);
    }

    if (!query && mood) {
      const categories = moodMusicMap[mood];
      const moodMusics = [];
      for (const cat of categories) {
        const result = await Musics.searchBykeywords(cat.trim().toLowerCase());
        if (result.length > 0) {
          moodMusics.push(...result);
        }
      }
      musicData = [...moodMusics];
    }

    if (!query && !mood) {
      const categories = moodMusicMap["calm"];
      let moodMusics = [];
      for (const cat of categories) {
        const result = await Musics.searchBykeywords(cat.trim().toLowerCase());
        if (result.length > 0) {
          const sortedMusics = await Musics.sortMusics(result);
          moodMusics.push(...sortedMusics);
        }
      }
      musicData = [...moodMusics];
    }

    if (musicData.length === 0) {
      if (query) {
        const response = await musicAPI.get("/search/tracks", {
          params: {
            q: query,
            limit: 30,
          },
        });
        const storedMusics = await Musics.storeMusics(response.data.collection);
        const sortedMusics = await Musics.sortMusics(storedMusics);
        musicData = [...sortedMusics];
      } else {
        const categories = moodMusicMap[mood] || moodMusicMap["calm"];

        let moodMusics = [];
        for (const cat of categories) {
          const response = await fetchMusics(cat.trim().toLowerCase());
          const storedMusics = await Musics.storeMusics(response);
          if (storedMusics.length > 0) {
            moodMusics.push(...storedMusics);
          }
        }
        const sortedMusics = await Musics.sortMusics(moodMusics);
        musicData = [...sortedMusics];
      }
    }

    if (!musicData || musicData.length === 0) {
      return res.status(500).json({
        success: false,
        error: "No songs found",
      });
    }

    const uniqueMusics = {};
    musicData.forEach((music) => {
      uniqueMusics[music.music_id] = music;
    });

    res.status(200).json({
      success: true,
      data: Object.values(uniqueMusics),
    });
  } catch (err) {
    console.error(err.stack);
    next(err);
  }
};

exports.getTrackInfo = async (req, res, next) => {
  try {
    const trackId = req.params.id;
    if (!trackId) {
      return res
        .status(400)
        .json({ success: false, error: "Track ID is required" });
    }

    let track = await Musics.getTrackById(trackId);

    if (!track || !track.progressive_url) {
      const response = await musicAPI.get(`/tracks/${trackId}`, {
        params: { client_id: process.env.CLIENT_ID },
      });

      if (!response.data) {
        return res
          .status(404)
          .json({ success: false, error: "Track not found" });
      }
      if (!track) {
        const storedTracks = await Musics.storeMusics([response.data]);
        track = storedTracks[0];
      }

      let progressiveUrl = track.progressive_url;
      if (!progressiveUrl) {
        const progressiveTrans = response.data.media.transcodings.find(
          (t) => t.format.protocol === "progressive",
        );

        if (progressiveTrans) {
          const transRes = await musicAPI.get(progressiveTrans.url, {
            params: { client_id: process.env.CLIENT_ID },
          });
          progressiveUrl = await Musics.updateProgressiveUrl(
            track.music_id,
            transRes.data.url,
          );
        }
      }

      track.progressive_url = progressiveUrl;
    }

    const trackInfo = {
      title: track.title,
      duration: track.duration,
      artwork: track.artwork_url,
      genre: track.genre,
      permalink: track.permalink_url,
      artist: track.artist_name || track.username,
      artistAvatar: track.artist_avatar,
      streamable: track.streamable,
      progressiveUrl: track.progressive_url,
    };

    res.status(200).json({ success: true, data: trackInfo });
  } catch (err) {
    console.error(err.stack);
    next(err);
  }
};
