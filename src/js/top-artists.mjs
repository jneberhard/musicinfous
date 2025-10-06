const API_KEY = "3479d48246e74981bf9426d21276ae3d";
const TOP_ARTISTS_LIMIT = 50;

export async function loadTopArtists() {
  try {
    // Fetch top artists in the United States
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=geo.gettopartists&country=${encodeURIComponent(
        "United States"
      )}&api_key=${API_KEY}&format=json&limit=${TOP_ARTISTS_LIMIT}`
    );

    if (!response.ok) {
      throw new Error(`Last.fm API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.topartists || !data.topartists.artist) {
      throw new Error("No top artists found.");
    }

    // Map simplified data for display
    return data.topartists.artist.map((artist) => ({
      name: artist.name,
      url: artist.url || "#", 
    }));
  } catch (error) {
    console.error("Failed to fetch top artists:", error);
    throw error;
  }
}
