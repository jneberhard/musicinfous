const LASTFM_API_KEY = "3479d48246e74981bf9426d21276ae3d";

// Fetch artist info by name from MusicBrainz
export async function fetchArtistInfo(name) {
  try {
    const res = await fetch(`https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(name)}&fmt=json&limit=1`);
    if (!res.ok) throw new Error("MusicBrainz error");
    const data = await res.json();
    return data.artists?.[0] || null;
  } catch (err) {
    console.error("Failed to fetch artist info:", err);
    return null;
  }
}

// Fetch popular tracks from Last.fm
export async function fetchTopSongs(artistName, limit = 20) {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`
    );
    const data = await res.json();
    const bio = data.artist?.bio?.summary || "";

    const tracksRes = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`
    );
    const tracksData = await tracksRes.json();
    let topTracks = tracksData.toptracks?.track || [];
    const seen = new Set();
    topTracks = topTracks.filter((track) => {
      if (seen.has(track.name)) return false;
      seen.add(track.name);
      return true;
    });

    return { bio, topTracks };
  } catch (err) {
    console.error("Failed to fetch artist details:", err);
    return { bio: "", topTracks: [] };
  }
}

// Initialize artist page
export async function initArtistPage() {
  const params = new URLSearchParams(window.location.search);
  const artistName = params.get("name");
  if (!artistName) return;

  const container = document.getElementById("artist-page-container");
  if (!container) return;

  container.innerHTML = `<p>Loading artist info...</p>`;

  const artist = await fetchArtistInfo(artistName);
  if (!artist) {
    container.innerHTML = "<p>Artist not found.</p>";
    return;
  }

  const { bio, topTracks } = await fetchTopSongs(artistName);

  if (!topTracks.length) {
    container.innerHTML = `
      <h2>${artist.name}</h2>
      <p>${bio}</p>
      <p>No top songs found.</p>
    `;
    return;
  }

  container.innerHTML = `
    <h2>${artist.name}</h2>
    <p>${bio}</p>
    <h3>Top Songs</h3>
    <ul id="artist-songs-list">
      ${topTracks
        .map(
          (track, index) => `
        <li>
            ${index + 1}.
          <a href="/song/song.html?title=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(artist.name)}">
            ${track.name}
          </a>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}
