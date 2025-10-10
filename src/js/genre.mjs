const API_KEY = "3479d48246e74981bf9426d21276ae3d";
const TOP_LIMIT = 25;

const genreMap = {
  Pop: "pop",
  Country: "country",
  Classical: "classical",
  Broadway: "musical", // Last.fm uses "musical" not "Broadway"
};

//search top artist for selected genre -------------------------------------------------

// --- Fetch top artists ---
async function loadTopArtists(genreTag) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=${encodeURIComponent(
    genreTag
  )}&api_key=${API_KEY}&format=json&limit=${TOP_LIMIT}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error fetching top artists: ${response.status}`);
  const data = await response.json();

  if (!data.topartists?.artist) throw new Error("No artists found for this genre");

  return data.topartists.artist.map((artist) => ({
    name: artist.name,
    url: artist.url,
    image: artist.image?.[2]?.["#text"] || "",
  }));
}

// search top songs for selected genre
// Fetch data from Last.fm
async function loadTopSongs(genreTag) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(
    genreTag
  )}&api_key=${API_KEY}&format=json&limit=${TOP_LIMIT}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Error fetching top songs: ${response.status}`);
  const data = await response.json();

  if (!data.tracks?.track) throw new Error("No songs found for this genre");

  return data.tracks.track.map((track) => ({
    title: track.name,
    artist: track.artist.name,
    url: track.url,
    image: track.image?.[2]?.["#text"] || "",
  }));
}

//export this

export async function renderGenre() {
  const params = new URLSearchParams(window.location.search);
  const genre = params.get("category");
  if (!genre) return;

  const genreTag = genreMap[genre] || genre.toLowerCase();

  const titleEl = document.getElementById("top-title");
  const songsEl = document.querySelector(".top-songs ul");
  const artistsEl = document.querySelector(".top-artists ul");

  if (!titleEl || !songsEl || !artistsEl) {
    console.warn("Missing one or more genre rendering elements in DOM.");
    return;
  }

  titleEl.textContent = `Top ${genre} Songs & Artists`;

  try {
    const [songs, artists] = await Promise.all([loadTopSongs(genreTag), loadTopArtists(genreTag)]);

    // Render songs
    songsEl.innerHTML = songs
      .map(
        (s, i) => `
        <li>
          <span class="rank">${i + 1}.</span>
          <a href="/song/song.html?title=${encodeURIComponent(s.title)}&artist=${encodeURIComponent(
            s.artist
          )}">${s.title}</a>
          <span class="artist"> — ${s.artist}</span>
        </li>`
      )
      .join("");

    // Render artists
    artistsEl.innerHTML = artists
      .map(
        (a, i) => `
        <li>
          <span class="rank">${i + 1}.</span>
          <a href="/artist/artist.html?name=${encodeURIComponent(a.name)}">${a.name}</a>
        </li>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    songsEl.innerHTML = "<li>Unable to load songs for this genre.</li>";
    artistsEl.innerHTML = "<li>Unable to load artists for this genre.</li>";
  }
}
// getting genres for the drop down
export async function loadGenres() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptags&api_key=${API_KEY}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch genres");
    const data = await response.json();

    const genres = data.tags?.tag || [];
    const dropdown = document.getElementById("genreSelect");

    if (!dropdown) {
      console.warn("Genre dropdown element not found.");
      return;
    }

    dropdown.innerHTML = '<option value="" selected disabled>Choose a genre...</option>';

    genres.forEach((tag) => {
      const option = document.createElement("option");
      const capitalized = tag.name
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      option.value = tag.name;
      option.textContent = capitalized;
      dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", (e) => {
      const selectedGenre = e.target.value;
      if (selectedGenre) {
        window.location.href = `/genre/genre.html?category=${encodeURIComponent(selectedGenre)}`;
      }
    });
  } catch (err) {
    console.error("Error loading genres:", err);
    const dropdown = document.getElementById("genreSelect");
    if (dropdown) {
      dropdown.innerHTML = "<option disabled>Error loading genres</option>";
    }
  }
}
