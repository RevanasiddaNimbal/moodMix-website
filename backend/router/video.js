const express = require("express");
const { getVideos, getChennels } = require("../controller/vidoe");
const autorize = require("../middlewares/authorization");
const router = express.Router();

router.get("/search", autorize, getVideos);

module.exports = router;
