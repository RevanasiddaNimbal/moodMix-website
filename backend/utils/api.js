const axios = require("axios");

const musicAPI = axios.create({
  baseURL: "https://api-v2.soundcloud.com",
  params: {
    client_id: process.env.CLIENT_ID,
  },
});

const exerciseAPI = axios.create({
  baseURL: "https://exercisedb.p.rapidapi.com",
  headers: {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": "exercisedb.p.rapidapi.com",
  },
});

const videoAPI = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3/",
  params: {
    key: process.env.VIDEOAPI_KEY,
  },
});

module.exports = { musicAPI, exerciseAPI, videoAPI };
