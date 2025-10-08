import { loadHeaderFooter } from "./utils.mjs";
import { renderTopSongs } from "./top-songs.mjs";
import { renderTopArtists } from "./top-artists.mjs";
//import { fetchArtistInfo, fetchTopTracks, fetchTopAlbums } from "./artists.mjs";
//import { loadSong } from "./song.mjs";
import { initSearchModal } from "./search.mjs";
import { trackVisits } from "./visits.mjs";
import { renderSongPage } from "./song.mjs";
import { initTopsPage } from "./tops.mjs";
import { renderSongResults } from "./songs.mjs";
import { renderArtistsPage } from "./artists.mjs";
import { initArtistPage } from "./artist.mjs";

async function initMain() {
  await loadHeaderFooter();
  initSearchModal();
  trackVisits();

  const path = window.location.pathname;

  // song details page
  if (path.endsWith("song.html")) {
    renderSongPage();
  }
  // top pages
  else if (path.includes("/top/")) {
    initTopsPage();
  }
  //song search results
  else if (path.endsWith("/song/songs.html")) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    const container = document.getElementById("results-container");
    const titleElem = document.getElementById("results-title");
    if (!container || !titleElem) return;

    if (query) {
      titleElem.textContent = `Songs matching "${query}"`;
      await renderSongResults(query, container);
    }
  }

  //artists results page
  else if (path.endsWith("/artist/artists.html")) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    const container = document.getElementById("artist-results-container");
    const titleElem = document.getElementById("results-title");
    if (query && container && titleElem) {
      titleElem.textContent = `Artists matching "${query}"`;
      await renderArtistsPage(query, container);
    }
  }
  // artist page results
  else if (path.endsWith("/artist.html")) {
    await initArtistPage();
  }
  // main page
  else if (path.endsWith("index.html") || path === "/") {
    renderTopSongs();
    renderTopArtists();
  }
}

document.addEventListener("DOMContentLoaded", initMain);
