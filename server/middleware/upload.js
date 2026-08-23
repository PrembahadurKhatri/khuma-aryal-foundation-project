import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  storage as cloudinaryStorage,
  documentStorage as cloudinaryDocumentStorage,
  mediaStorage as cloudinaryMediaStorage,
  applicationStorage as cloudinaryApplicationStorage,
  noticeStorage as cloudinaryNoticeStorage,
  isCloudinaryConfigured,
} from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// Cloudinary is used whenever CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are
// all set in .env (images persist permanently regardless of hosting).
// Falls back to local disk (server/uploads/, served statically from
// server.js) if they're not configured — e.g. a fresh clone before
// Cloudinary is set up — so uploads still work out of the box.
const storage = isCloudinaryConfigured ? cloudinaryStorage : diskStorage;

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

// Separate instance for non-image documents (Notice attachments, Download
// files) — same disk fallback, but Cloudinary needs its raw-resource
// storage config (see config/cloudinary.js) and a different mimetype
// allowlist.
const DOCUMENT_MIMETYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const documentStorage = isCloudinaryConfigured ? cloudinaryDocumentStorage : diskStorage;
const baseDocumentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (!DOCUMENT_MIMETYPES.includes(file.mimetype)) {
      return cb(new Error("Only PDF/Word/Excel/PowerPoint files are allowed"));
    }
    cb(null, true);
  },
});

// Gallery videos — a single multer instance handling both the "video" field
// (the actual video file, potentially large) and an optional "thumbnail"
// image field together. Cloudinary routing per-field is handled by
// mediaStorage's params function (see config/cloudinary.js); the fileFilter
// here just checks each field got the right kind of file.
const mediaStorage = isCloudinaryConfigured ? cloudinaryMediaStorage : diskStorage;
const baseMediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB — videos run much bigger than images
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "video" && !file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed for the video field"));
    }
    if (file.fieldname === "thumbnail" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed for the thumbnail field"));
    }
    cb(null, true);
  },
});

// Job applications — "resume" (PDF/Word) and "coverLetter" (a PDF *or* an
// image — applicants upload a scanned/photographed cover letter instead of
// typing one) uploaded together. Cloudinary routing per-field is handled by
// applicationStorage's params function (see config/cloudinary.js).
const APPLICATION_MIMETYPES = {
  resume: DOCUMENT_MIMETYPES,
  coverLetter: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
};
const applicationStorage = isCloudinaryConfigured ? cloudinaryApplicationStorage : diskStorage;
const baseApplicationUpload = multer({
  storage: applicationStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = APPLICATION_MIMETYPES[file.fieldname];
    if (allowed && !allowed.includes(file.mimetype)) {
      return cb(new Error(`Only PDF/image files are allowed for the ${file.fieldname} field`));
    }
    cb(null, true);
  },
});

// Notices — "attachment" (PDF/doc) and "images" (photos, up to 6, for the
// notice's own detail-page gallery) uploaded together. Needs its own
// instance (not the generic image-only `upload.fields`) because "attachment"
// is a document, not an image — the fileFilter below has to branch per field
// the same way noticeStorage's params function does.
const noticeStorage = isCloudinaryConfigured ? cloudinaryNoticeStorage : diskStorage;
const baseNoticeUpload = multer({
  storage: noticeStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "attachment") {
      if (!DOCUMENT_MIMETYPES.includes(file.mimetype)) {
        return cb(new Error("Only PDF/Word/Excel/PowerPoint files are allowed for the attachment field"));
      }
    } else if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed for the images field"));
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
  document: (field) => [baseDocumentUpload.single(field), normalizePaths],
  notice: (fieldsConfig) => [baseNoticeUpload.fields(fieldsConfig), normalizePaths],
  media: (fieldsConfig) => [baseMediaUpload.fields(fieldsConfig), normalizePaths],
  application: (fieldsConfig) => [baseApplicationUpload.fields(fieldsConfig), normalizePaths],
};

export default upload;
