import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vercel/Netlify/custom domain: keep base as "/".
// GitHub Pages at https://<user>.github.io/<repo>/: set base to "/<repo>/" instead.
export default defineConfig({
  plugins: [react()],
  base: "/",
});
