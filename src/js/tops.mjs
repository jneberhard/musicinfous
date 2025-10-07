import { renderTopSongs } from "./top-songs.mjs";
import { renderTopArtists } from "./top-artists.mjs";

export async function initTopsPage() {
  // Read category from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const topTitle = document.getElementById("top-title");

    if (!topTitle) return;

        // Hide both sections initially
    const topSongsDiv = document.querySelector(".top-songs");
    const topArtistsDiv = document.querySelector(".top-artists");
    if (topSongsDiv) topSongsDiv.style.display = "none";
    if (topArtistsDiv) topArtistsDiv.style.display = "none";

            // Render based on category
    if (category === "Top Songs") {
        topTitle.textContent = "Top Songs";
        if (topSongsDiv) {
        topSongsDiv.style.display = "block";
        renderTopSongs();
        }
    } else if (category === "Top Artists") {
        topTitle.textContent = "Top Artists";
        if (topArtistsDiv) {
        topArtistsDiv.style.display = "block";
        renderTopArtists();
        }
    } else {
        topTitle.textContent = "Top Music";
  }
}