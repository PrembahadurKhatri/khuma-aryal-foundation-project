import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { storage as cloudinaryStorage, isCloudinaryConfigured } from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

// Cloudinary is used whenever CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are
// all set in .env (images persist permanently regardless of hosting).
// Falls back to local disk (server/uploads/, served statically from
// server.js) if they're not configured — e.g. a fresh clone before
// Cloudinary is set up — so uploads still work out of the box.
let storage;
if (isCloudinaryConfigured) {
  storage = cloudinaryStorage;
} else {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
}

const baseUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Cloudinary storage already leaves req.file.path as a secure_url. Local
// disk storage leaves it as an absolute filesystem path — normalize that to
// the public URL controllers should actually save.
const normalizePaths = (req, res, next) => {
  if (!isCloudinaryConfigured) {
    if (req.file) req.file.path = `/uploads/${req.file.filename}`;
    if (req.files) {
      Object.values(req.files).flat().forEach((f) => {
        f.path = `/uploads/${f.filename}`;
      });
    }
  }
  next();
};

const upload = {
  single: (field) => [baseUpload.single(field), normalizePaths],
  array: (field, maxCount) => [baseUpload.array(field, maxCount), normalizePaths],
  fields: (fieldsConfig) => [baseUpload.fields(fieldsConfig), normalizePaths],
};

export default upload;
