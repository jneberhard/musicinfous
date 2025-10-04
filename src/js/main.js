import { loadHeaderFooter } from "./utils.mjs";
import { loadTopSongs } from "./top-songs.mjs";
import { loadTopArtists } from "./top-artists.mjs";
import { fetchArtistInfo, fetchTopTracks, fetchTopAlbums } from "./artists.mjs";
import { loadSong } from "./song.mjs";

async function initMain() {
  await loadHeaderFooter();
  /// for the number of visits
  const visitsDisplay = document.querySelector(".visits"); //   Initialize display element variable
  const lastVisitDisplay = document.querySelector(".last-visit"); // Initialize last visit display

  let numVisits = Number(localStorage.getItem("numVisits-ls")) || 0; //  Get the stored VALUE for the numVisits-ls KEY in localStorage if it exists.
  let lastVisit = localStorage.getItem("lastVisit-ls"); //get the stored value for the last visit

  numVisits++; // increment the number of visits by one.
  // Determine if this is the first visit or display the number of visits. We wrote this example backwards in order for you to think deeply about the logic.
  if (visitsDisplay) {
    if (numVisits === 1) {
      visitsDisplay.textContent = `This is your first visit. 🥳 Welcome!`;
    } else {
      visitsDisplay.textContent = numVisits;
    }
  }

  // Display last visit
  if (lastVisitDisplay) {
    if (lastVisit) {
      const lastVisitDate = new Date(lastVisit);
      const now = new Date();
      const diffTime = now - lastVisitDate; // in ms
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        lastVisitDisplay.textContent = "Your last visit was today.";
      } else if (diffDays === 1) {
        lastVisitDisplay.textContent = "Your last visit was yesterday.";
      } else {
        lastVisitDisplay.textContent = `Your last visit was ${diffDays} days ago.`;
      }
    } else {
      lastVisitDisplay.textContent = "This is your first recorded visit.";
    }
  }

  localStorage.setItem("numVisits-ls", numVisits); // store the new visit total into localStorage, key=numVisits-ls
  localStorage.setItem("lastVisit-ls", new Date().toISOString()); // store the current date for the last visit

  //for the modal
  const searchSongsBtn = document.getElementById("search-songs-btn");
  const searchArtistsBtn = document.getElementById("search-artists-btn");
  const modal = document.getElementById("search-modal");
  const modalTitle = modal?.querySelector("h2");
  const closeBtn = modal?.querySelector(".close-btn");

  if (searchSongsBtn && searchArtistsBtn && modal && closeBtn) {
    const openModal = (title) => {
      modal.style.display = "flex";
      modalTitle.textContent = title;
    };

    searchSongsBtn.addEventListener("click", () => openModal("Search Songs"));
    searchArtistsBtn.addEventListener("click", () => openModal("Search Artists"));

    closeBtn.addEventListener("click", () => (modal.style.display = "none"));

    window.addEventListener("click", (event) => {
      if (event.target === modal) modal.style.display = "none";
    });
  }

  //Load top songs
  const container = document.querySelector(".top-songs ul");
  if (container) {
    try {
      const songs = await loadTopSongs();
      container.innerHTML = "";

      songs.forEach((song, index) => {
        const li = document.createElement("li");
        const songUrl = `song/index.html?song=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`;
        // Add the number (index + 1) before the song
        li.innerHTML = `${index + 1}. <a href="${songUrl}">${song.title}</a> by ${song.artist}`;
        container.appendChild(li);
      });
    } catch (error) {
      container.innerHTML = `<li class="error">⚠️ Failed to load top songs: ${error.message}</li>`;
    }
  }
  // load top artists
  const artistContainer = document.querySelector(".top-artists ul");
  if (artistContainer) {
    try {
      const artists = await loadTopArtists();
      artistContainer.innerHTML = "";

      artists.forEach((artist, index) => {
        const li = document.createElement("li");
        const artistUrl = `artist/index.html?name=${encodeURIComponent(artist.name)}`;
        li.innerHTML = `${index + 1}. <a href="${artistUrl}">${artist.name}</a>`;
        artistContainer.appendChild(li);
      });
    } catch (error) {
      artistContainer.innerHTML = `<li class="error">⚠️ Failed to load top artists: ${error.message}</li>`;
    }
  }
  // artist page
  const artistInfoContainer = document.getElementById("artist-info");
  if (artistInfoContainer) {
    const params = new URLSearchParams(window.location.search);
    const artistName = params.get("name");
    if (!artistName) return;

    const topTracksContainer = document.getElementById("top-tracks");
    const topAlbumsContainer = document.getElementById("top-albums");

    try {
      const artistInfo = await fetchArtistInfo(artistName);
      artistInfoContainer.innerHTML = `
            <h1>${artistName}</h1>
            <p>${artistInfo.bio}</p>
            <p><a href="${artistInfo.url}" target="_blank">Official website</a></p>
        `;

      const tracks = await fetchTopTracks(artistName);
      topTracksContainer.innerHTML = tracks
        .map((t, i) => `<li>${i + 1}. <a href="${t.url}" target="_blank">${t.name}</a></li>`)
        .join("");

      const albums = await fetchTopAlbums(artistName);
      topAlbumsContainer.innerHTML = albums
        .map(
          (a) => `
            <li>
                <img src="${a.url}" alt="${a.title}" width="100"/>
                ${a.title} (${a.year || "Unknown"})
            </li>
            `
        )
        .join("");
    } catch (error) {
      artistInfoContainer.innerHTML = `<p class="error">⚠️ Failed to load artist data: ${error.message}</p>`;
    }
  }
  // song page
  if (document.getElementById("song-info")) {
    const params = new URLSearchParams(window.location.search);
    const songName = params.get("song");
    const artistName = params.get("artist");

    if (songName && artistName) {
      try {
        const songData = await loadSong(songName, artistName);

        document.getElementById("song-title").textContent = songData.title;
        document.getElementById("song-artist").textContent = `Artist: ${songData.artist}`;
        document.getElementById("song-album").textContent = `Album: ${songData.album}`;
        document.getElementById("song-release").textContent = `Released: ${songData.release}`;
        const linkEl = document.getElementById("song-link");
        linkEl.href = songData.url;
        linkEl.textContent = "Listen on Last.fm";
      } catch (error) {
        document.getElementById("song-info").innerHTML = `<p class="error">⚠️ ${error.message}</p>`;
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", initMain);
