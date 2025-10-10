const API_KEY = "3479d48246e74981bf9426d21276ae3d";

export async function renderSongDetails() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const artist = params.get("artist");

  if (!title || !artist) {
    document.querySelector(".song-details").innerHTML = "<p>Song not found.</p>";
    return;
  }

  document.querySelector(".song-title").textContent = title;
  document.querySelector(".song-artist").textContent = artist;

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(
        artist
      )}&track=${encodeURIComponent(title)}&format=json`
    );

    const data = await response.json();

    if (data.track) {
      const infoDiv = document.querySelector(".song-info");
      infoDiv.innerHTML = `
        <p><strong>Album:</strong> ${data.track.album?.title || "Unknown"}</p>
        <p><strong>Listeners:</strong> ${data.track.listeners}</p>
        <p><strong>Playcount:</strong> ${data.track.playcount}</p>
        <p><a href="${data.track.url}" target="_blank">View on Last.fm</a></p>
      `;
    } else {
      document.querySelector(".song-info").innerHTML = "<p>Details not available.</p>";
    }
  } catch (err) {
    console.error("Error fetching song info:", err);
    document.querySelector(".song-info").innerHTML = "<p>Error loading song details.</p>";
  }
}
