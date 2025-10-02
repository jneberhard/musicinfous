import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        song: resolve(__dirname, "src/song/index.html"),
        artist: resolve(__dirname, "src/artist/index.html"),
        genre: resolve(__dirname, "src/genre/index.html"),
        top: resolve(__dirname, "src/top/index.html"),
      },
    },
  },
});