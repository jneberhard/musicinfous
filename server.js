import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
