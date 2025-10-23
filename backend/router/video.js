const express = require("express");
const { getVideos, getChennels } = require("../controller/vidoe");
const router = express.Router();

router.get("/search", getVideos);

module.exports = router;
