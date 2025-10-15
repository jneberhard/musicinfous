const LASTFM_API_KEY = "3479d48246e74981bf9426d21276ae3d";

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// info from musicBrainz
export async function loadSongData(title, artist) {
  if (!title || !artist) return null;
  const headers = {"User-Agent": "MusicInfoApp/1.0 (jreberhard3@gmail.com)",
  };

  const query = `recording: ${title} AND artist:${artist}`;
  const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=50&inc=releases+artist-credits+genres+tags+release-groups+labels`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Failed to fetch song data");

    const data = await response.json();
    if (!data.recordings?.length) return null;

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

    if (!filteredRecordings.length) return null;

    // Remove duplicates
    const seen = new Set();
    const uniqueRecordings = filteredRecordings.filter((rec) => {
      const artistName = rec["artist-credit"]?.[0]?.name || "Unknown";
      const key = `${rec.title}-${artistName}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by release
    const recordings = uniqueRecordings
      .map((rec) => {
        const firstRelease = rec.releases?.[0];
        const date = firstRelease?.date || "Unknown";
        const country = firstRelease?.country || "Unknown";
        const releaseGroupId = firstRelease?.["release-group"]?.id || rec["release-group"]?.id;
        const label = firstRelease?.["label-info"]?.[0]?.label?.name || firstRelease?.label || "Unknown";

        return {
          ...rec,
          releaseDate: date,
          country,
          releaseGroupId,
          label,
          popularity: 0,
        };
      })

      const lastFmFetches = recordings.map(async (rec) => {
      const trackTitle = encodeURIComponent(rec.title);
      const artistName = encodeURIComponent(rec["artist-credit"]?.[0]?.name || artist);

      // getting popularity from lastFM
      const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${artistName}&track=${trackTitle}&format=json`;

      try {
        const res = await fetch(url);
        if (res.ok) {
          const data1 = await res.json();
          rec.popularity = Number(data1.track?.playcount || 0);
        }
      } catch (err) {
        console.warn("Last.fm playcount fetch failed for", rec.title, err);
      }
      });
      await Promise.all(lastFmFetches);
      recordings.sort((a, b) => b.popularity - a.popularity);

    const mostPopularRecording = recordings[0];
    const otherRecordings = recordings.slice(1, 20);
    const lengthSec = mostPopularRecording.length
      ? Math.floor(mostPopularRecording.length / 1000)
      : null;

    // 🔍 Fetch genre info .....
    let genres = [];
    if (mostPopularRecording.releaseGroupId) {
      try {
        const genreUrl = `https://musicbrainz.org/ws/2/release-group/${mostPopularRecording.releaseGroupId}?inc=genres+tags&fmt=json`;
        const genreRes = await fetch(genreUrl, { headers });
        if (genreRes.ok) {
          const genreData = await genreRes.json();
          genres =
            genreData.genres?.map((genre) => genre.name) ||
            genreData.tags?.map((tag) => tag.name) ||
            [];
        }
      } catch (genreErr) {
        console.warn("Genre fetch failed:", genreErr);
      }
    }

    return {
      title: mostPopularRecording.title,
      artist: mostPopularRecording["artist-credit"]?.[0]?.name || "Unknown",
      lengthSec,
      releaseDate: mostPopularRecording.releaseDate,
      country: mostPopularRecording.country,
      label: mostPopularRecording.label,
      genres: genres.length ? genres : ["Unknown"],
      popularity: mostPopularRecording.popularity,
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
        <p><strong>Country:</strong> ${songData.country}</p>
        <p><strong>Label:</strong> ${songData.label}</p>
        <p><strong>Total Listens: </strong> ${songData.popularity.toLocaleString()}</p>
        <p><strong>Genres:</strong> ${Array.isArray(songData.genres) ? songData.genres.map(capitalizeWords).join(", ") : capitalizeWords(songData.genres)}</p>
        <p><strong>Recordings: (Click on "view" to find more info, i.e. writers, publisher, etc.</strong></p>
        ${
          songData.otherRecordings?.length
            ? `
        <ul>
          ${songData.otherRecordings
            .map((rel) =>
                `<li class="list-item"><strong>${rel.title}</strong> (${rel.releaseDate}) — ${rel["artist-credit"]?.[0]?.name || "Unknown Artist"}
                — Listens: ${rel.popularity.toLocaleString()}
                <a href="https://musicbrainz.org/recording/${rel.id}" target="_blank">[view]</a></li>`
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
              <img src="${coverArt}" alt="Album cover for ${songData.title} by ${songData.artist}" class="album-art" />
            </div>`
          : ""
      }
    </div>
  `;
}