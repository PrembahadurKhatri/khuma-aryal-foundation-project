import fs from "fs";
import path from "path";
import sharp from "sharp";
import { isCloudinaryConfigured } from "../config/cloudinary.js";

// Cloudinary already optimizes/transforms on its own -- this only matters
// for local disk storage, where an uploaded photo is saved and served
// exactly as the visitor's phone/camera produced it (often several hundred
// KB to a few MB). Shrinking it once, here, at upload time means every
// later read of that file -- by a visitor, by Cloudflare re-fetching after
// a cache expiry, by anything -- costs less of this account's metered I/O,
// for the file's entire lifetime. Converting to WebP on top of that
// typically saves another 25-35% over an equivalent-quality JPEG/PNG.
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 80;

// Returns the new .webp filename on success, or null if this file wasn't
// touched (not an image, or compression failed) -- multer's original file
// is left completely alone in the failure case, so an upload never breaks
// because of this step.
const compressImageFile = async (filePath, mimetype) => {
  if (!mimetype?.startsWith("image/") || mimetype === "image/svg+xml") return null;
  try {
    const buffer = await sharp(filePath)
      .rotate() // apply EXIF orientation, then strip it (rotate() with no args also removes the EXIF tag)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const webpPath = filePath.replace(/\.[^./]+$/, ".webp");
    fs.writeFileSync(webpPath, buffer);

    // The .webp file is what matters -- it's already written and correct
    // at this point. Deleting the old-format file is just cleanup, so a
    // failure here (e.g. a lingering file handle) must not undo a
    // successful compression; it just leaves one harmless unused file
    // behind instead of silently keeping the uncompressed original live.
    if (webpPath !== filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error(`Could not remove original file ${filePath} after compressing to ${webpPath}: ${unlinkErr.message}`);
      }
    }
    return path.basename(webpPath);
  } catch (err) {
    console.error(`Image compression failed for ${filePath}: ${err.message}`);
    return null;
  }
};

// Runs after multer has saved file(s) to disk (req.file / req.files) and
// before normalizePaths rewrites .path into a public URL -- needs the real
// filesystem path multer left behind, and updates .filename/.path in place
// so normalizePaths builds the URL against the new .webp file, not the
// original upload's now-deleted name. Only ever touches image mimetypes;
// document/video fields pass through untouched even when mixed into the
// same multi-field upload (e.g. Notice's "attachment" + "images").
const compressUploadedImages = async (req, res, next) => {
  if (isCloudinaryConfigured) return next();

  const files = [...(req.file ? [req.file] : []), ...(req.files ? Object.values(req.files).flat() : [])];
  await Promise.all(
    files.map(async (f) => {
      const newFilename = await compressImageFile(f.path, f.mimetype);
      if (newFilename) {
        f.filename = newFilename;
        f.path = path.join(path.dirname(f.path), newFilename);
      }
    })
  );
  next();
};

export default compressUploadedImages;
