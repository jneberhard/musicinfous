const API_KEY = "3479d48246e74981bf9426d21276ae3d";

import { renderArtistResults } from "../js/search.mjs";

// Fetch artist info
export async function fetchArtistInfo(artistName) {
  try {
    const mbResponse = await fetch(
      `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(artistName)}&fmt=json&limit=1`
    );

    if (!mbResponse.ok) {
      throw new Error(`API error! Status: ${mbResponse.status}`);
    }

    const data = await mbResponse.json();
    const artist = data.artists?.[0];
    if (!artist) {
      return {
        name: artistName,
        bio: "No biography available.",
      };
    }

    return {
      name: artist.name,
      bio: artist.disambiguation || "No biography available.",
    };
  } catch (err) {
    console.warn("Failed to fetch artist details:", err);
    return {
      name: artistName,
      bio: "Error fetching artist info.",
    };
  }
}

export async function renderArtistsPage(query, container) {
  if (!query || !container) return;

  const artists = await renderArtistResults(query, container, true);

  if (!artists || artists.length === 0) {
    container.innerHTML = "<p>No artists found.</p>";
    return;
  }

  container.innerHTML = "";
  const seen = new Set();

  for (const artist of artists) {
    const artistName = artist.name;
    if (!artistName || seen.has(artistName.toLowerCase())) continue;
    seen.add(artistName.toLowerCase());

    const { bio } = await fetchArtistInfo(artistName);

    const card = document.createElement("a");
    card.href = `/artist/artist.html?name=${encodeURIComponent(artistName)}`;
    card.classList.add("artist-card");

    card.innerHTML = `
      <div class="artist-info">
        <h3>${artistName}</h3>
        <p>${bio.slice(0, 120)}...</p>
      </div>
    `;

    container.appendChild(card);
  }
}
