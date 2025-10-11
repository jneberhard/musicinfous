const LASTFM_API_KEY = "3479d48246e74981bf9426d21276ae3d";

// info from musicBrainz
export async function loadSongData(title, artist) {
  if (!title || !artist) return null;
  const headers = {
    "User-Agent": "MusicInfoApp/1.0 (jreberhard3@gmail.com)",
  };

  const query = `${title} AND artist:${artist}`;
  const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(
    query
  )}&fmt=json&limit=100&inc=artist-credits+releases+work-rels+artist-rels`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`MusicBrainz error: ${response.status}`);
    const data = await response.json();
    if (!data.recordings || data.recordings.length === 0) return null;

    const filteredRecordings = data.recordings.filter((rec) => {
      const artistCredit = rec["artist-credit"]?.[0]?.name?.toLowerCase().trim() || "";
      const recTitle = rec.title?.toLowerCase().trim() || "";
      const inputArtist = artist.toLowerCase().trim();
      const inputTitle = title.toLowerCase().trim();

      return (
        artistCredit.includes(inputArtist) &&
        (recTitle.includes(inputTitle) || inputTitle.includes(recTitle))
      );
    });


   // if (filteredRecordings.length === 0) return null;

    // Remove duplicates by title + artist
    const seen = new Set();
    const uniqueRecordings = filteredRecordings.filter((rec) => {
      const artistName = rec["artist-credit"]?.[0]?.name || "Unknown";
      const key = `${rec.title}-${artistName}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
        // Sort all recordings by earliest release date
        const recordings = uniqueRecordings
          .map((rec) => {
            const firstRelease = rec.releases?.[0];
            const date = firstRelease?.date || "Not Listed"; // sort-friendly
            return { ...rec, releaseDate: date };
          })
          .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));   ///making it so it sorts it by dates

    // Earliest and next recordings
    const earliestRecording = recordings[0];
    const otherRecordings = recordings.slice(1, 20);  // the (1, 20) number tells how many recordings to show

    const lengthSec = earliestRecording.length
      ? Math.floor(earliestRecording.length / 1000)
      : null;

    return {
      title: earliestRecording.title,
      artist: earliestRecording["artist-credit"]?.[0]?.name || "Unknown",
      lengthSec,
      releaseDate: earliestRecording.releases?.[0]?.date || "Unknown",
      otherRecordings,
    };
  } catch (err) {
    console.error("Failed to fetch song data:", err);
    return null;
  }
}

// get cover art from Last.fm
export async function loadCoverArt(title, artist) {
  if (!title || !artist) return { image: "", url: "" };
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(
    artist
  )}&track=${encodeURIComponent(title)}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Last.fm error: ${response.status}`);
    const data = await response.json();

    return {
      image: data.track?.album?.image?.[3]?.["#text"] || "",
      url: data.track?.url || "",
    };
  } catch (err) {
    console.warn("Failed to fetch cover art:", err);
    return "";
  }
}

// convert seconds to minutes and seconds
function formatLength(seconds) {
  if (!seconds) return "Unknown";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// to render song details page
export async function renderSongPage() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const artist = params.get("artist");

  const container = document.getElementById("song-info");
  if (!container) return;

  if (!title || !artist) {
    container.innerHTML = "<p>No song selected.</p>";
    return;
  }

  container.innerHTML = "<p>Loading song info...</p>";

  const [songData, coverArtData] = await Promise.all([
    loadSongData(title, artist),
    loadCoverArt(title, artist),
  ]);

  const coverArt = coverArtData.image;
  const lastfmUrl = coverArtData.url;

  if (!songData) {
    container.innerHTML = `<p style="color: black;">Song information not found. Try searching by song.</p>`;
    return;
  }

  songData.artist = artist;

  // links
  const youtubeQuery = encodeURIComponent(`${artist} ${title}`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${youtubeQuery}`;
  const geniusQuery = encodeURIComponent(`${artist} ${title} lyrics`);
  const geniusUrl = `https://genius.com/search?q=${geniusQuery}`;
  const wikiUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
    `${artist} ${title}`
  )}`;

  // render page
  container.innerHTML = `
    <div class="song-details-container">
      <div class="song-text">
        <h2>${songData.title}</h2>
        <p><strong>Artist:</strong> ${songData.artist}</p>
        <p><strong>Length:</strong> ${formatLength(songData.lengthSec)}</p>
        <p><strong>First Release:</strong> ${songData.releaseDate}</p>
        <p><strong>Recordings: (Click on "view" to find more info, i.e. writers, publisher, etc.</strong></p>
        ${
          songData.otherRecordings?.length
            ? `
        <ul>
          ${songData.otherRecordings
            .map(
              (r) =>
                `<li><strong>${r.title}</strong> (${r.releaseDate}) — ${r["artist-credit"]?.[0]?.name || "Unknown Artist"}
                <a href="https://musicbrainz.org/recording/${r.id}" target="_blank">[view]</a></li>`
            )
            .join("")}
        </ul>`
            : ""
        }

        <p>
          <a href="${youtubeUrl}" target="_blank" class="listen-link">Listen on YouTube</a>
          <a href="${lastfmUrl}" target="_blank" class="listen-link">View on Last.fm</a>
          <a href="${geniusUrl}" target="_blank" class="listen-link">View Lyrics on Genius</a>
          <a href="${wikiUrl}" target="_blank" class="listen-link">Get info on Wikipedia</a>
        </p>
      </div>

      ${
        coverArtData
          ? `<div class="song-cover">
              <img src="${coverArt}" alt="${songData.title} album cover" class="album-art" />
            </div>`
          : ""
      }
    </div>
  `;
}