const axios = require("axios");

const musicAPI = axios.create({
  baseURL: "https://api-v2.soundcloud.com",
});

const exerciseAPI = axios.create({
  baseURL: "https://exercisedb.p.rapidapi.com",
  headers: {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": "exercisedb.p.rapidapi.com",
  },
});

module.exports = { musicAPI, exerciseAPI };
