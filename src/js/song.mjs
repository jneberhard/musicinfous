//getting song information from musicBrainz and art information from last.fm
const LASTFM_API_KEY = "3479d48246e74981bf9426d21276ae3d";


// info from musicBrainz
export async function loadSongData(title, artist) {
  if (!title || !artist) return null;

  const query = `${title} AND artist:${artist}`;
  const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(
    query
  )}&fmt=json&limit=1&inc=artist-credits+releases+work-rels+work-level-rels`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`MusicBrainz error: ${response.status}`);

    const data = await response.json();
    if (!data.recordings || data.recordings.length === 0) return null;

    const recording = data.recordings[0];
    const writerSet = new Set();

    // Collect writers from recording relations
    recording.relations?.forEach((rel) => {
      if (["composer", "writer", "lyricist"].includes(rel.type?.toLowerCase()) && rel.artist?.name) {
        writerSet.add(rel.artist.name);
      }
    });

    // Collect writers from work-level relations
    recording["work-rels"]?.forEach((workRel) => {
      workRel.work?.relations?.forEach((r) => {
        if (["composer", "writer", "lyricist"].includes(r.type?.toLowerCase()) && r.artist?.name) {
          writerSet.add(r.artist.name);
        }
      });
    });
    const lengthSec = recording.length ? Math.floor(recording.length / 1000) : null; // seconds

    const writers = writerSet.size ? Array.from(writerSet).join(", ") : "Unknown";
    return {
      title: recording.title,
      artist: recording["artist-credit"]?.[0]?.name || "Unknown",
      lengthSec,
      writers,
      releaseDate: recording.releases?.[0]?.date || "Unknown",
    };
  } catch (err) {
    console.error("Failed to fetch song data:", err);
    return null;
  }
}

// get cover art from Last.fm

export async function loadCoverArt(title, artist) {
  if (!title || !artist) return "";
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(
    artist
  )}&track=${encodeURIComponent(title)}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Last.fm error: ${response.status}`);
    const data = await response.json();

  return data.track?.album?.image?.[3]["#text"] || "";
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

  const [songData, coverArt] = await Promise.all([
    loadSongData(title, artist),
    loadCoverArt(title, artist),
  ]);

  if (!songData) {
    container.innerHTML = "<p>Song information not found.</p>";
    return;
  }

  songData.artist = artist;
  
  // try to find on youtube
  const youtubeQuery = encodeURIComponent(`${artist} ${title}`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${youtubeQuery}`;


  container.innerHTML = `
    <div class="song-details-container">
      <div class="song-text">
        <h2>${songData.title}</h2>
        <p><strong>Artist:</strong> ${songData.artist}</p>
        <p><strong>Length:</strong> ${formatLength(songData.lengthSec)}</p>
        <p><strong>Writers:</strong> ${songData.writers}</p>
        <p><strong>Release Date:</strong> ${songData.releaseDate}</p>
        <p><a href="${youtubeUrl}" target="_blank" class="listen-link">Listen on YouTube</a></p>
      </div>
      ${
        coverArt
          ? `<div class="song-cover">
              <img src="${coverArt}" alt="${songData.title} album cover" class="album-art" />
            </div>`
          : ""
      }
    </div>
  `;
}