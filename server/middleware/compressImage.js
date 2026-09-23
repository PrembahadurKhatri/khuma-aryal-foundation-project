import fs from "fs";
import sharp from "sharp";
import { isCloudinaryConfigured } from "../config/cloudinary.js";

// Cloudinary already optimizes/transforms on its own -- this only matters
// for local disk storage, where an uploaded photo is saved and served
// exactly as the visitor's phone/camera produced it (often several hundred
// KB to a few MB). Shrinking it once, here, at upload time means every
// later read of that file -- by a visitor, by Cloudflare re-fetching after
// a cache expiry, by anything -- costs less of this account's metered I/O,
// for the file's entire lifetime.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 80;

const compressImageFile = async (filePath, mimetype) => {
  if (!mimetype?.startsWith("image/") || mimetype === "image/svg+xml") return;
  try {
    let pipeline = sharp(filePath)
      .rotate() // apply EXIF orientation, then strip it (rotate() with no args also removes the EXIF tag)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });

    if (mimetype === "image/png") pipeline = pipeline.png({ quality: JPEG_QUALITY, compressionLevel: 9 });
    else if (mimetype === "image/webp") pipeline = pipeline.webp({ quality: JPEG_QUALITY });
    else pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    const buffer = await pipeline.toBuffer();
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    // A compression failure should never break the upload itself -- the
    // original file multer already saved is left exactly as-is.
    console.error(`Image compression failed for ${filePath}: ${err.message}`);
  }
};

// Runs after multer has saved file(s) to disk (req.file / req.files) and
// before normalizePaths rewrites .path into a public URL -- needs the real
// filesystem path multer left behind. Only ever touches image mimetypes;
// document/video fields pass through untouched even when mixed into the
// same multi-field upload (e.g. Notice's "attachment" + "images").
const compressUploadedImages = async (req, res, next) => {
  if (isCloudinaryConfigured) return next();

  const files = [...(req.file ? [req.file] : []), ...(req.files ? Object.values(req.files).flat() : [])];
  await Promise.all(files.map((f) => compressImageFile(f.path, f.mimetype)));
  next();
};

export default compressUploadedImages;
