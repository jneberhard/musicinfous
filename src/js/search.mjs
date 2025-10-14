import { updateLastSongSearch, updateLastArtistSearch } from "./user.mjs";

const LASTFM_API_KEY = "3479d48246e74981bf9426d21276ae3d";

export function initSearchModal() {
  const searchSongsBtn = document.getElementById("search-songs-btn");
  const searchArtistsBtn = document.getElementById("search-artists-btn");
  const modal = document.getElementById("search-modal");
  const modalTitle = modal?.querySelector("h2");
  const closeBtn = modal?.querySelector(".close-btn");
  const searchInput = document.getElementById("search-input");
  const searchSubmit = document.getElementById("search-submit");
  const searchResults = document.getElementById("search-results");

  let currentSearchType = ""; // "songs" or "artists"

  if (!modal || !searchInput || !searchSubmit || !searchResults) return;

  // --- Modal open/close ---
  const openModal = (title, type) => {
    modal.style.display = "flex";
    modalTitle.textContent = title;
    currentSearchType = type;
    searchInput.value = "";
    searchResults.innerHTML = "";
  };

  if (searchSongsBtn) {
    searchSongsBtn.addEventListener("click", () => openModal("Search Songs", "songs"));
  }
  if (searchArtistsBtn) {
    searchArtistsBtn.addEventListener("click", () => openModal("Search Artists", "artists"));
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
  });

  searchSubmit.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (!query) return;

    const encodedQuery = encodeURIComponent(query);

    if (currentSearchType === "artists") {
      updateLastArtistSearch(query);
      window.location.href = `/artist/artists.html?query=${encodedQuery}`;
    }
    else if (currentSearchType === "songs") {
      updateLastSongSearch(query);
      window.location.href = `/song/songs.html?query=${encodedQuery}`;
    }
    else {
      searchResults.innerHTML = "<p>Please select Songs or Artists first.</p>";
    }
  });
  //return key to search also
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchSubmit.click();
    }
  });
}

//  Search for songs
export async function searchSongs(query) {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/recording?query=recording:"${encodeURIComponent(query)}"&limit=100&fmt=json`
  );
  const data = await response.json();

  if (!data.recordings?.length) {
    searchResults.innerHTML = "<p>No songs found.</p>";
    return;
  }

  // remove duplicates - same title and artist
  const seen = new Set();
  const uniqueRecordings = data.recordings.filter((recording) => {
    const key = `${recording.title.toLowerCase()}|${recording["artist-credit"]?.[0]?.name?.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueRecordings.slice(0, 50);
}

async function albumCover(songTitle, artistName) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(songTitle)}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Last.fm API error");

    const data = await res.json();
    return (
      data.track?.album?.image?.[3]["#text"] ||
      data.track?.album?.image?.[2]["#text"] ||
      "https://via.placeholder.com/100?text=Song"
    );
  } catch (err) {
    console.warn("Failed to fetch Last.fm cover:", err);
    return "https://via.placeholder.com/100?text=Song";
  }
}

export async function renderSongResults(query, container) {
  if (!recordings.length) {
    container.innerHTML = "<p>No songs found.</p>";
    return;
  }

  container.innerHTML = "";

  for (const recording of recordings) {
    const li = document.createElement("li");
    li.classList.add("song-card");

    const songTitle = recording.title;
    const artistName = recording["artist-credit"]?.[0]?.name || "Unknown Artist";

    // Await the async function
    const imageUrl = await albumCover(songTitle, artistName);

    li.innerHTML = `
      <img src="${imageUrl}" alt="${songTitle} album art" />
      <div class="song-info">
        <span class="song-title">${songTitle}</span>
        <span class="song-artist">${artistName}</span>
      </div>
    `;

    container.appendChild(li);
  }
}

//   show artists
export async function renderArtistResults(query, container, returnData = false) {
  if (!query || !container) return [];

  try {
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(query)}&fmt=json&limit=40`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const artists = data.artists ?? [];

    if (artists.length === 0) {
      container.innerHTML = "<p>No artists found.</p>";
      return [];
    }

    //  Remove duplicates
    const seen = new Set();
    const uniqueArtists = artists.filter((artist) => {
      const name = artist.name?.toLowerCase();
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });

    if (returnData) {
      return uniqueArtists;
    }

    container.innerHTML = "";
    uniqueArtists.forEach((artist) => {
      const li = document.createElement("li");
      li.classList.add("artist-card");

      const imageUrl = "https://via.placeholder.com/100?text=Artist";

      li.innerHTML = `
        <img src="${imageUrl}" alt="${artist.name}" />
        <div class="artist-info">${artist.name}</div>
      `;

      container.appendChild(li);
    });

    return uniqueArtists;
  } catch (error) {
    console.error("Failed to fetch artist results:", error);
    container.innerHTML = "<p>Error loading artists. Please try again later.</p>";
    return [];
  }
}
