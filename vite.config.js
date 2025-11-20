import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Assistenku Core",
        short_name: "Assistenku",
        theme_color: "#0d6efd",
        background_color: "#ffffff",
        display: "standalone",
        icons: []
      }
    })
  ]
});
