// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// config aman untuk Vercel
export default defineConfig({
  plugins: [react()],
});
