import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;
const API_KEY = "3479d48246e74981bf9426d21276ae3d";

// Enable CORS for Vite dev server
app.use(cors());

// Proxy endpoint for TheAudioDB top tracks
app.get("/api/top10/:artist", async (req, res) => {
  const artist = req.params.artist;
  try {
    const response = await fetch(`https://theaudiodb.com/api/v1/json/2/track-top10.php?s=${artist}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching top tracks:", error);
    res.status(500).json({ error: "Failed to fetch from TheAudioDB" });
  }
});

// ✅ Fetch top songs by genre
app.get("/api/genre-songs", async (req, res) => {
  const genre = req.query.genre;
  if (!genre) return res.status(400).json({ error: "Genre is required" });

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(
        genre
      )}&limit=20&api_key=${API_KEY}&format=json`
    );

    const data = await response.json();
    res.json(data.toptracks?.track || []);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching genre songs:", err);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

// ✅ Fetch top artists by genre
app.get("/api/genre-artists", async (req, res) => {
  const genre = req.query.genre;
  if (!genre) return res.status(400).json({ error: "Genre is required" });

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=${encodeURIComponent(
        genre
      )}&limit=20&api_key=${API_KEY}&format=json`
    );

    const data = await response.json();
    res.json(data.topartists?.artist || []);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching genre artists:", err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
