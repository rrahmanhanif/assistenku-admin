// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      external: [
        "@supabase/supabase-js",
        "firebase",
        "firebase/app",
        "firebase/auth",
      ],
    },
  },
});
