const { musicAPI } = require("../utils/api");

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

exports.getMusics = async (req, res, next) => {
  const query = req.body?.q?.trim();
  const mood = req.body?.mood;

  try {
    let data;
    if (query) {
      const response = await musicAPI.get("/search/tracks", {
        params: {
          q: query,
          client_id: process.env.CLIENT_ID,
          limit: 30,
        },
      });
      data = response.data;
    } else if (mood && moodMusicMap[mood]) {
      const musics = moodMusicMap[mood] || moodMusicMap["calm"];
      let moodMusics = [];

      for (const music of musics) {
        const response = await musicAPI.get("/search/tracks", {
          params: {
            q: music,
            client_id: process.env.CLIENT_ID,
            limit: 30,
          },
        });
        if (response.data && response.data.collection) {
          moodMusics.push(...response.data.collection);
        }
      }

      const uniqueTracks = {};
      moodMusics.forEach((track) => {
        uniqueTracks[track.id] = track;
      });

      data = { collection: Object.values(uniqueTracks) };
    } else {
      const musics = moodMusicMap["calm"];
      const moodmusics = [];
      for (const music of musics) {
        const response = await musicAPI.get("/search/tracks", {
          params: {
            q: music,
            client_id: process.env.CLIENT_ID,
            limit: 30,
          },
        });
        if (response.data && response.data.collection) {
          moodmusics.push(...response.data.collection);
        }
      }
      const uniqueTracks = {};
      moodmusics.forEach((track) => {
        uniqueTracks[track.id] = track;
      });

      data = { collection: Object.values(uniqueTracks) };
    }

    if (!data || !data.collection || data.collection.length === 0) {
      return res.status(500).json({
        success: false,
        error: "No songs found",
      });
    }

    res.status(200).json({
      success: true,
      data: data.collection,
    });
  } catch (err) {
    console.error(err.stack);
    next(err);
  }
};

exports.getTrackInfo = async (req, res, next) => {
  try {
    const trackId = req.params.id;
    const response = await musicAPI.get(`/tracks/${trackId}`, {
      params: {
        client_id: process.env.CLIENT_ID,
      },
    });
    if (!response.data) {
      return res.status(500).json({
        success: false,
        error: "Failed to get the track.",
      });
    }

    const track = response.data;

    const progressiveTrans = track.media.transcodings.find(
      (t) => t.format.protocol == "progressive"
    );

    let playableUrl = null;

    if (progressiveTrans) {
      const transRes = await musicAPI.get(progressiveTrans.url, {
        params: { client_id: process.env.CLIENT_ID },
      });
      playableUrl = transRes.data.url;
    }
    const trackinfo = {
      title: track.title,
      duration: track.duration,
      artwork: track.artwork_url,
      genre: track.genre,
      permalink: track.permalink_url,
      artist: track.user?.full_name,
      artistAvatar: track.user?.avatar_url,
      streamable: track.streamable,
      progressiveUrl: playableUrl,
    };
    res.status(200).json({ success: true, data: trackinfo });
  } catch (err) {
    console.error(err.stack);
    next(err);
  }
};
