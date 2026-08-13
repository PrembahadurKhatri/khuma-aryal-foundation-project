import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // In dev, api.js calls relative "/api/..." paths (see services/api.js) —
  // proxy those (and /uploads, for <img src> tags pointing at uploaded
  // files) straight to the Express server so no CORS config is needed
  // locally. Override the target with VITE_API_TARGET if the backend runs
  // on a different port.
  const apiTarget = env.VITE_API_TARGET || "http://localhost:5001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: false,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true },
        "/uploads": { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
