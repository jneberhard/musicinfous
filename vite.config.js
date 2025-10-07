import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        song: resolve(__dirname, "src/song/song.html"),
        songs: resolve(__dirname, "src/song/songs.html"),
        artist: resolve(__dirname, "src/artist/artist.html"),
        artists: resolve(__dirname, "src/artist/artists.html"),
        genre: resolve(__dirname, "src/genre/index.html"),
        top: resolve(__dirname, "src/top/index.html"),
      },
    },
  },
});
