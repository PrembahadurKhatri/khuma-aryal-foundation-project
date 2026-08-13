import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

// Images are stored on local disk (server/uploads/), served statically from
// server.js. Simple, no external account needed. If this ever moves to a
// host with an ephemeral filesystem (e.g. Render's free tier), swap this
// storage engine for Cloudinary/S3 — every controller here just reads
// req.file.path, so the swap is contained to this one file.
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

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

// Local disk storage leaves req.file.path as an absolute filesystem path —
// normalize it to the public URL controllers should actually save.
const normalizePaths = (req, res, next) => {
  if (req.file) req.file.path = `/uploads/${req.file.filename}`;
  if (req.files) {
    Object.values(req.files).flat().forEach((f) => {
      f.path = `/uploads/${f.filename}`;
    });
  }
  next();
};

const upload = {
  single: (field) => [baseUpload.single(field), normalizePaths],
  array: (field, maxCount) => [baseUpload.array(field, maxCount), normalizePaths],
  fields: (fieldsConfig) => [baseUpload.fields(fieldsConfig), normalizePaths],
};

export default upload;
