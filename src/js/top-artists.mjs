const API_KEY = "3479d48246e74981bf9426d21276ae3d";
const TOP_ARTISTS_LIMIT = 50;

// --- Fetch top artists ---
export async function loadTopArtists() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=${encodeURIComponent(
    "United States"
  )}&api_key=${API_KEY}&format=json&limit=${TOP_ARTISTS_LIMIT}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Last.fm API error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.topartists?.artist) {
      throw new Error("No top artists found.");
    }

    // Return simplified array
    return data.topartists.artist.map((artist) => ({
      name: artist.name,
      url: artist.url || "#",
    }));
  } catch (err) {
    console.error("Failed to fetch top artists:", err);
    throw err;
  }
}

// --- Render artists to the page ---
export async function renderTopArtists() {
  const topArtistsContainer = document.querySelector(".top-artists ul");
  if (!topArtistsContainer) return;

  try {
    const artists = await loadTopArtists();
    topArtistsContainer.innerHTML = artists
      .slice(0, 50)
      .map(
            (a, index) =>
            `<li><span class="artist-rank">${index + 1}.</span>
            <a href="/artist/artist.html?name=${encodeURIComponent(a.name)}">${a.name}</a>
            </li>`
      )
      .join("");
  } catch (err) {
    console.error("Failed to render top artists:", err);
    topArtistsContainer.innerHTML = "<li>Unable to load top artists.</li>";
  }
}