const API_KEY = "3479d48246e74981bf9426d21276ae3d";
const TOP_LIMIT = 25;

const genres = [
  "Pop", "Rock", "Hip Hop", "Jazz", "Classical", "Electronic", "Country", "Reggae", "Blues", "R&B",
  "Indie", "Metal", "Punk", "Soul", "Folk", "Disco", "Funk", "Alternative", "Latin", "World",
  "Reggaeton", "K-Pop", "EDM", "House", "Techno", "Trance", "Dubstep", "Trap", "Ambient", "Psychedelic",
  "Synthwave", "Post-Rock", "Hardcore", "Grunge", "Emo", "Gothic", "Industrial", "Ska", "Bluegrass",
  "Gospel", "Opera", "Chamber Music", "New Age", "Experimental", "Lo-Fi Hip Hop", "Trap Soul", "Chillwave",
  "Vaporwave", "Post-Punk", "Shoegaze"
];

const genreMap = {
  Pop: "pop",
  Country: "country",
  Classical: "classical",
  Broadway: "musical", // Last.fm uses "musical" not "Broadway"
};

//search top artist for selected genre -------------------------------------------------

// --- Fetch top artists ---
async function loadTopArtists(genreTag) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=${encodeURIComponent(genreTag)}&api_key=${API_KEY}&format=json&limit=${TOP_LIMIT}`;

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
  const url = `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(genreTag)}&api_key=${API_KEY}&format=json&limit=${TOP_LIMIT}`;

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
      .map((song, i) => `
        <li class="list-item">
          <span class="rank">${i + 1}.</span>
          <a href="/song/song.html?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}">${song.title}</a>
          <span class="artist"> — ${song.artist}</span>
        </li>`
      )
      .join("");

    // Render artists
    artistsEl.innerHTML = artists
      .map((artist, i) => `
        <li class="list-item">
          <span class="rank">${i + 1}.</span>
          <a href="/artist/artist.html?name=${encodeURIComponent(artist.name)}">${artist.name}</a>
        </li>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    songsEl.innerHTML = "<li>Unable to load songs for this genre.</li>";
    artistsEl.innerHTML = "<li>Unable to load artists for this genre.</li>";
  }
}
// getting genres for the drop down ------------------------------------------------------
export function loadGenres() {
  const dropdown = document.getElementById("genreSelect");
  if (!dropdown) {
    console.warn("Genre dropdown element not found.");
    return;
  }

  const sortedGenres = [...genres].sort((a, b) => a.localeCompare(b));

  sortedGenres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    dropdown.appendChild(option);
  });

  // Handle genre selection
  dropdown.addEventListener("change", (event) => {
    const selectedGenre = event.target.value;
    if (selectedGenre) {
      window.location.href = `/genre/genre.html?category=${encodeURIComponent(selectedGenre)}`;
    }
  });
}
