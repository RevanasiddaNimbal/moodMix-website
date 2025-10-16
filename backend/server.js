require("dotenv").config();
const pool = require("./config/db");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const authentication = require("./router/userAuth");
const playmusic = require("./router/music");
const exercises = require("./router/exercise");

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.137.1:5173",
      "https://moodmix.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", exercises);
app.use("/api/auth", authentication);
app.use("/api/musics", playmusic);

app.get("/", (req, res) => {
  res.status(200).send("hello from server");
});

app.use((req, res, next) => {
  res.status(404).json({
    message: "Router not found.",
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error: ", err.stack);
  res.status(500).json({
    message: "Something went wrong on the server!",
  });
});

app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    console.error("Failed to start server :", err.stack);
  } else {
    console.log(`Server running on http://localhost:${port}`);
  }
});
