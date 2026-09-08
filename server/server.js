// MUST be the very first import. ES modules fully execute every imported
// file (recursively) before any of THIS file's own top-level code runs —
// including a `dotenv.config()` call written further down. Several modules
// imported below (config/cloudinary.js, utils/generateToken.js,
// utils/fallbackAdmin.js) read process.env.* at module-load time, so if
// dotenv.config() ran after those imports (as a plain statement further
// down this file, like it used to), they'd all silently see undefined env
// vars and fall back to hardcoded defaults — .env would load "successfully"
// with zero effect. The side-effect import form runs immediately, as the
// first thing Node does, before any other import in this file is even
// resolved.
import "dotenv/config";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import vacancyRoutes from "./routes/vacancyRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import leaderRoutes from "./routes/leaderRoutes.js";
import boardMemberRoutes from "./routes/boardMemberRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.join(__dirname, "../client/dist");

connectDB();

const app = express();
// Render (like most PaaS) puts the app behind a reverse proxy — without
// this, req.ip resolves to the proxy's own internal address for every
// request, silently collapsing every visitor into one shared IP bucket
// for both the rate limiter below and the login-attempt limiter in
// authRoutes.js.
app.set("trust proxy", 1);

// Security & parsing middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:"],
        // Without this, helmet's default CSP falls back frame-src to
        // default-src 'self' — blocking every embedded video iframe on the
        // Gallery page (YouTube/Vimeo), even a correctly-formed embed URL.
        "frame-src": [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://player.vimeo.com",
          "https://www.facebook.com",
        ],
      },
    },
  })
);
// CLIENT_URL may be a single origin or a comma-separated list. Each
// configured origin also implicitly allows its www./non-www. counterpart
// and tolerates a trailing slash — a real visitor opening the exact same
// site via a link shared on Instagram/Facebook (which often normalizes or
// rewrites the URL slightly, e.g. adding "www.") was hitting a strict
// exact-string mismatch here and getting every API call blocked, even
// though the page itself loaded fine.
const normalizeOrigin = (o) => o.trim().replace(/\/+$/, "");
const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);
const allowedOrigins = new Set(
  configuredOrigins.flatMap((o) => [o, o.includes("://www.") ? o.replace("://www.", "://") : o.replace("://", "://www.")])
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl, server-to-server, same-origin
      if (allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
      // Reject by simply not granting CORS (callback(null, false)) instead of
      // passing an Error -- an Error here falls through to the generic error
      // handler as an uncaught 500 (res.statusCode is still 200 at this
      // point, so errorHandler.js defaults it to 500) instead of a clean,
      // deliberate rejection. The browser still blocks the response either
      // way; this just avoids a misleading server error for what is, from
      // the server's point of view, entirely expected behavior.
      console.warn(`CORS: rejected origin ${origin}`);
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ["/auth/login", "/auth/refresh", "/auth/forgot-password", "/auth/reset-password"].includes(req.path),
});
app.use("/api", limiter);

// Locally-stored uploads (see middleware/upload.js).
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running" }));
app.get("/", (req, res) => res.send("Server is running 🚀"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/gallery", albumRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/vacancies", vacancyRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/leaders", leaderRoutes);
app.use("/api/board-members", boardMemberRoutes);

// Serve the built React app in production so frontend + API share one
// origin — but only if client/dist is actually present. On a split
// deployment (this server on Render, the client built separately on
// Vercel), client/dist never exists here, so skip this block entirely
// rather than registering a catch-all route that would crash with
// ENOENT on every non-/api request.
if (process.env.NODE_ENV === "production" && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`));
