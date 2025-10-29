const { musicAPI } = require("../utils/api");
const Musics = require("../model/music");

const moodMusicMap = {
  happy: [
    "Pharrell Williams - Happy (English)",
    "Arijit Singh - Nashe Si Chadh Gayi (Hindi)",
    "Rajesh Krishnan - Priya Priya (Kannada)",
    "Dhanush - Rowdy Baby (Tamil)",
    "Sid Sriram - Samajavaragamana (Telugu)",
  ],

  sad: [
    "Adele - Someone Like You (English)",
    "Arijit Singh - Tum Hi Ho (Hindi)",
    "Rajesh Krishnan - Hrudaya Geethe (Kannada)",
    "Ilaiyaraaja - En Iniya Pon Nilave (Tamil)",
    "Sid Sriram - Maate Vinadhuga (Telugu)",
    "K.S. Chithra - Oru Naal (Malayalam)",
  ],

  calm: [
    "Sunil T J -kannada songs Melody",
    "feeling songs kannada ",
    "Minnalvala  Radio kannada songs ",
    "harish_murthy - Kannada Songs ",
    "Jack Johnson - Better Together (English)",
  ],

  angry: [
    "Rage Against the Machine - Killing in the Name (English)",
    "Gully Boy - Apna Time Aayega (Hindi)",
    "Bajrang Dal - Fight Song (Kannada)",
    "Sid Sriram - Verithanam (Tamil)",
    "Sid Sriram - Aathadi (Telugu)",
    "Linkin Park - One Step Closer (English)",
  ],

  excited: [
    "Queen - Don't Stop Me Now (English)",
    "Arijit Singh - Ghungroo (Hindi)",
    "Kaviraj & Vijay Prakash - Banna Bannada Loka (Kannada)",
    "Dhanush - Rowdy Baby (Tamil)",
    "Anirudh - Surviva (Telugu)",
    "Yo Yo Honey Singh - Desi Kalakaar (Hindi)",
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
    console.log("mood:", mood);

    await Musics.updateHistory(query, mood);

    let musicData = query ? await Musics.searchBykeywords(query) : [];
    if (musicData.length > 0) {
      musicData = await Musics.sortMusics(musicData);
    }

    if (!query && mood) {
      const categories = moodMusicMap[mood];
      const moodMusics = [];
      for (const cat of categories) {
        console.log("Fetching musics for category:", cat);
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
          moodMusics.push(...result);
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
          (t) => t.format.protocol === "progressive"
        );

        if (progressiveTrans) {
          const transRes = await musicAPI.get(progressiveTrans.url, {
            params: { client_id: process.env.CLIENT_ID },
          });
          progressiveUrl = await Musics.updateProgressiveUrl(
            track.music_id,
            transRes.data.url
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
