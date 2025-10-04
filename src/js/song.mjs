const API_KEY = "3479d48246e74981bf9426d21276ae3d";

export async function loadSong(songName, artistName) {
  try {
    // Use Last.fm track.getInfo method
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(songName)}&format=json`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Last.fm API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.track) {
      throw new Error("Song not found.");
    }

    return {
      title: data.track.name,
      artist: data.track.artist.name,
      album: data.track.album?.title || "Unknown Album",
      release: data.track.wiki?.published || "Unknown Release Date",
      url: data.track.url,
    };
  } catch (error) {
    console.error("Failed to load song:", error);
    throw error;
  }
}