const express = require("express");
const { getMusics, getTrackInfo } = require("../controller/music");
const authorize = require("../middlewares/authorization");
const router = express.Router();

router.post("/search/track", authorize, getMusics);
router.get("/stream/:id", authorize, getTrackInfo);

module.exports = router;
