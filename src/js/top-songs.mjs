const API_KEY = "3479d48246e74981bf9426d21276ae3d";
const TOP_SONGS_LIMIT = 30;

// --- Fetch data from Last.fm ---
export async function loadTopSongs(genre = null) {
  const method = genre ? "tag.getTopTracks" : "geo.gettoptracks";
  const param = genre ? `tag=${encodeURIComponent(genre)}` : "country=United%20States";
  const url = `https://ws.audioscrobbler.com/2.0/?method=${method}&${param}&api_key=${API_KEY}&format=json&limit=${TOP_SONGS_LIMIT}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Last.fm API error! Status: ${response.status}`);
    }

    const data = await response.json();
    const tracks = genre ? data.tracks?.track : data.tracks?.track;
    if (!tracks) {
      throw new Error("No top tracks found.");
    }

    return tracks.map((track) => ({
      title: track.name,
      artist: track.artist.name,
      url: track.url || "#",
      image: track.image?.[2]?.["#text"] || track.image?.[1]?.["#text"] || "",
    }));
  } catch (err) {
    console.error("Failed to fetch top tracks:", err);
    throw err;
  }
}

// --- Render data into the page ---
export async function renderTopSongs(genre = null) {
  const topSongsContainer = document.querySelector(".top-songs ul");
  if (!topSongsContainer) return;

  const isSongsPage = window.location.pathname.includes("songs.html");

  try {
    const songs = await loadTopSongs(genre);
    topSongsContainer.innerHTML = songs
      .slice(0, 30)
      .map(
        (s, index) => `
          <li class="list-item">
            <span class="song-rank">${index + 1}.</span>
            <a href="/song/song.html?title=${encodeURIComponent(s.title)}&artist=${encodeURIComponent(
              s.artist
            )}" class="song-link">
              ${isSongsPage && s.image ? `<img src="${s.image}" alt="${s.title} album art" class="song-thumb" />` : ""}
              <span class="song-title">${s.title}</span>
            </a>
            <span class="song-artist"> — ${s.artist}</span>
          </li>
        `
      )
      .join("");
  } catch (err) {
    console.error("Failed to render top songs:", err);
    topSongsContainer.innerHTML = "<li>Unable to load top songs.</li>";
  }
}
