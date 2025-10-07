// artist-scripts.mjs
const API_KEY = "3479d48246e74981bf9426d21276ae3d";

// Fetch artist info
export async function fetchArtistInfo(artistName) {
  try {
    const response = await fetch(
      `https://theaudiodb.com/api/v1/json/${API_KEY}/search.php?s=${encodeURIComponent(artistName)}`
    );

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.artists || data.artists.length === 0) {
      return { bio: "No biography available.", url: "#" };
    }

    const artist = data.artists[0];
    return {
      bio: artist.strBiographyEN || "No biography available.",
      url: artist.strWebsite || "#",
    };
  } catch (error) {
    console.error("Failed to fetch artist info:", error);
    return { bio: "Failed to load artist info.", url: "#" };
  }
}

// Fetch top tracks for artist
export async function fetchTopTracks(artistName) {
  try {
    const response = await fetch(
      `https://theaudiodb.com/api/v1/json/${API_KEY}/track-top10.php?s=${encodeURIComponent(artistName)}`
    );

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.track) return [];

    return data.track.map(track => ({
      name: track.strTrack,
      url: track.strMusicVid || "#",
    }));
  } catch (error) {
    console.error("Failed to fetch top tracks:", error);
    return [];
  }
}

// Fetch top albums for artist
export async function fetchTopAlbums(artistName) {
  try {
    const response = await fetch(
      `https://theaudiodb.com/api/v1/json/${API_KEY}/searchalbum.php?s=${encodeURIComponent(artistName)}`
    );

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.album) return [];

    return data.album.map(album => ({
      title: album.strAlbum,
      year: album.intYearReleased,
      url: album.strAlbumThumb || "#",
    }));
  } catch (error) {
    console.error("Failed to fetch top albums:", error);
    return [];
  }
}