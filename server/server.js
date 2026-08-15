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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.join(__dirname, "../client/dist");

connectDB();

const app = express();

// Security & parsing middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:"],
      },
    },
  })
);
// CLIENT_URL may be a single origin or a comma-separated list.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl, server-to-server, same-origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
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
  skip: (req) => ["/auth/login", "/auth/refresh"].includes(req.path),
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

// Serve the built React app in production so frontend + API share one origin.
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`));
