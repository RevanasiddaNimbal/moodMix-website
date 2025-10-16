const express = require("express");
const { getImage, getExercises } = require("../controller/exercise");
const authorized = require("../middlewares/authorization");

const router = express.Router();

router.get("/exercises", authorized, getExercises);
router.get("/exercise-image", authorized, getImage);

module.exports = router;
