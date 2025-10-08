const API_KEY = "3479d48246e74981bf9426d21276ae3d";

// --- Search artists by name ---
export async function searchArtists(query) {
  if (!query) return [];

  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(
    query
  )}&api_key=${API_KEY}&format=json&limit=50`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Last.fm API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results?.artistmatches?.artist) {
      throw new Error("No artists found.");
    }

    // Return simplified array
    return data.results.artistmatches.artist.map((artist) => ({
      name: artist.name,
      url: artist.url || "#",
      image:
        artist.image?.find((img) => img.size === "large")?.["#text"] || "",
      listeners: artist.listeners,
    }));
  } catch (err) {
    console.error("Failed to search artists:", err);
    throw err;
  }
}

// --- Render search results to the page ---
export async function renderArtistSearch(query) {
  const resultsContainer = document.querySelector(".artist-results ul");
  if (!resultsContainer) return;

  try {
    const artists = await searchArtists(query);

    if (artists.length === 0) {
      resultsContainer.innerHTML = "<li>No artists found.</li>";
      return;
    }

    resultsContainer.innerHTML = artists
      .map(
        (artist) => `
        <li>
          <a href="/artist/artist.html?name=${encodeURIComponent(artist.name)}">
            ${artist.image ? `<img src="${artist.image}" alt="${artist.name}" />` : ""}
            <span class="artist-name">${artist.name}</span>
            <small>${artist.listeners} listeners</small>
          </a>
        </li>`
      )
      .join("");
  } catch (err) {
    console.error("Failed to render search results:", err);
    resultsContainer.innerHTML = "<li>Error loading search results.</li>";
  }
}