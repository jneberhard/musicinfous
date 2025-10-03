// Try to get values from Vite env, then global config, then fallback
const clientId =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SPOTIFY_CLIENT_ID) ||
  window.__SPOTIFY_CONFIG?.CLIENT_ID ||
  "your-client-id-here";

const redirectUri =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SPOTIFY_REDIRECT_URI) ||
  window.__SPOTIFY_CONFIG?.REDIRECT_URI ||
  "http://localhost:5173/"; // must match Spotify dashboard

/**
 * Starts Spotify Authorization Code Flow with PKCE
 */
export async function initiateSpotifyAuth() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem("spotify_code_verifier", codeVerifier);

  const authUrl =
    `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code_challenge_method=S256&code_challenge=${codeChallenge}` +
    `&scope=user-top-read`;

  window.location.href = authUrl;
}

/**
 * Exchanges authorization code for access token and fetches top tracks
 */
export async function loadTopSongs() {
  const code = new URLSearchParams(window.location.search).get("code");
  const codeVerifier = localStorage.getItem("spotify_code_verifier");

  if (!code || !codeVerifier) {
    throw new Error("Missing authorization code or code verifier");
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Token request failed: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const tracksResponse = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?limit=10",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!tracksResponse.ok) {
    const errorText = await tracksResponse.text();
    throw new Error(`Tracks request failed: ${errorText}`);
  }

  const tracksData = await tracksResponse.json();

  return tracksData.items.map(item => ({
    title: item.name,
    artist: item.artists.map(a => a.name).join(", "),
    url: item.external_urls.spotify
  }));
}

/**
 * Generates a secure random code verifier
 */
function generateCodeVerifier(length = 128) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map(x => possible[x % possible.length])
    .join("");
}

/**
 * Converts code verifier to code challenge using SHA-256
 */
async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}