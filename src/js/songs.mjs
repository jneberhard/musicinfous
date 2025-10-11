const API_KEY = "3479d48246e74981bf9426d21276ae3d";

import { searchSongs } from "../js/search.mjs";

// get cover art
async function fetchCoverArt(song, artist) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(song)}&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Last.fm error: " + response.status);
    const data = await response.json();
    return data.track?.album?.image?.[3]["#text"] || data.track?.album?.image?.[2]["#text"] || "";
  } catch (err) {
    console.warn("Failed to fetch cover art:", err);
    return "";
  }
}

export async function renderSongResults(query, container) {
  console.log("Searching for songs:", query);
  const recordings = await searchSongs(query);

  if (!recordings || recordings.length === 0) {
    container.innerHTML = "No songs found.";
    return;
  }

  container.innerHTML = "";

  const seen = new Set();
  for (const track of recordings) {
    const songTitle = track.title;
    const artistName = track["artist-credit"]?.[0]?.name || "unknownArtist";

    if (!songTitle || !artistName) continue;
    // removing duplicates
    const key = `${songTitle.toLowerCase()}-${artistName.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Fetch cover art
    const coverUrl = await fetchCoverArt(songTitle, artistName);

    // Create card
    const card = document.createElement("a");
    card.href = `/song/song.html?title=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artistName)}`;
    card.classList.add("song-card");

    card.innerHTML = `
            ${coverUrl ? `<img src="${coverUrl}" alt="${songTitle} album art" />` : ""}
            <div class="song-info">
                <div class="song-title">${songTitle}</div>
                <div class="song-artist">${artistName}</div>
            </div>
        `;

    container.appendChild(card);
  }
}
