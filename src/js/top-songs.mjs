const API_KEY = "3479d48246e74981bf9426d21276ae3d";
const TOP_SONGS_LIMIT = 50


export async function loadTopSongs() {
  try {
    // Fetch the top tracks globally from Last.fm
    const response = await fetch(
  `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=United%20States&api_key=${API_KEY}&format=json&limit=${TOP_SONGS_LIMIT}`
);

    if (!response.ok) {
      throw new Error(`Last.fm API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.tracks || !data.tracks.track) {
      throw new Error("No top tracks found.");
    }

    // Map simplified data for display
    return data.tracks.track.map((track) => ({
      title: track.name,
      artist: track.artist.name,
      url: track.url || "#", // link to track on Last.fm
    }));
  } catch (error) {
    throw error;
  }
}