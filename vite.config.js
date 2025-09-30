import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",  // ✅ 入口改成 HTML
        "scripts/content": "./src/scripts/content.js",
        "scripts/service-worker": "./src/scripts/service-worker.js",
        "scripts/inject": "./src/scripts/inject.js",
      },
      output: {
        entryFileNames: ({ name }) => {
          if (name === "main") return "assets/main.js";
          if (name.startsWith("scripts/")) {
            const fileName = name.replace("scripts/", "");
            return `assets/${fileName}.js`;
          }
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const originalFileName =
            assetInfo.sourceFileName || assetInfo.fileName;
          return "assets/[name].[ext]";
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
    hmr: true,
  },
});
