import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080/",
        changeOrigin: true,
        // ws: true,
      },
    },
  },
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "solid",
      autoCodeSplitting: true,
    }),
    solid(),
  ],
});
