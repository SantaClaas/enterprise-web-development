import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

function removeDataTestId() {
  return {
    name: "remove-data-testid",
    apply: "build" as const,
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!/\.[jt]sx?$/.test(id)) return;
      return code
        .replace(/\s+data-testid="[^"]*"/g, "")
        .replace(/\s+data-testid=\{[^}]*\}/g, "");
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
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
    removeDataTestId(),
    tailwindcss(),
    tanstackRouter({
      target: "solid",
      autoCodeSplitting: true,
    }),
    solid(),
  ],
});
