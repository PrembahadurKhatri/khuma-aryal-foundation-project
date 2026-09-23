// One-time migration: converts every already-locally-stored image
// (server/uploads/*.jpg|.jpeg|.png) to a compressed .webp, the same
// resize+quality treatment middleware/compressImage.js already applies
// automatically to every NEW upload going forward. This script exists only
// to bring the 325 images migrated off Cloudinary (and anything uploaded
// since) in line with that -- new uploads don't need this, only what's
// already on disk from before this feature existed.
//
// Additive-safe: a file is only deleted after its .webp replacement is
// successfully written; any single item that fails is logged and left
// completely untouched (still pointing at its original file) rather than
// aborting the run. Skips anything already .webp, any non-local
// (Cloudinary/remote) URL, and non-image file fields (attachments, resumes,
// videos). Safe to re-run: already-converted fields are skipped.
//
//   DRY_RUN=1 node scripts/convertUploadsToWebp.js   -- prints what would change, touches nothing
//   node scripts/convertUploadsToWebp.js             -- does the real conversion
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import sharp from "sharp";

import Leader from "../models/Leader.js";
import BoardMember from "../models/BoardMember.js";
import Project from "../models/Project.js";
import News from "../models/News.js";
import Notice from "../models/Notice.js";
import Album from "../models/Album.js";
import Event from "../models/Event.js";
import Story from "../models/Story.js";
import Video from "../models/Video.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");

const API_ORIGIN = process.env.API_ORIGIN || "https://api.khumaaryalfoundation.org.np";
const DRY_RUN = process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 80;

let converted = 0;
let skipped = 0;
let failed = 0;

// Matches a URL this API's own normalizePaths would have produced --
// .../uploads/<filename> -- and only a convertible raster format (not
// .webp already, not .gif/.svg which don't convert cleanly this way).
const LOCAL_UPLOAD_RE = /\/uploads\/([^/?#]+)$/;
const CONVERTIBLE_EXT_RE = /\.(jpe?g|png)$/i;

const localFilenameIfConvertible = (value) => {
  if (typeof value !== "string") return null;
  const match = value.match(LOCAL_UPLOAD_RE);
  if (!match) return null;
  return CONVERTIBLE_EXT_RE.test(match[1]) ? match[1] : null;
};

const convertFileToWebp = async (filename) => {
  const srcPath = path.join(uploadsDir, filename);
  if (!fs.existsSync(srcPath)) throw new Error(`file not found on disk: ${filename}`);

  const webpFilename = filename.replace(/\.[^./]+$/, ".webp");
  const webpPath = path.join(uploadsDir, webpFilename);

  const buffer = await sharp(srcPath)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  fs.writeFileSync(webpPath, buffer);
  try {
    fs.unlinkSync(srcPath);
  } catch (unlinkErr) {
    console.error(`  (converted OK, but could not remove old file ${filename}: ${unlinkErr.message} -- harmless, just an unused leftover)`);
  }
  return webpFilename;
};

const migrateField = async (doc, field, label) => {
  const value = doc[field];
  const items = Array.isArray(value) ? value : [value];
  let changed = false;
  const next = [];

  for (const item of items) {
    const filename = localFilenameIfConvertible(item);
    if (!filename) {
      next.push(item);
      continue;
    }
    try {
      if (DRY_RUN) {
        console.log(`[dry-run] would convert ${label} ${doc._id}: ${filename}`);
        next.push(item);
      } else {
        const webpFilename = await convertFileToWebp(filename);
        const newUrl = `${API_ORIGIN}/uploads/${webpFilename}`;
        console.log(`converted ${label} ${doc._id}: ${filename} -> ${webpFilename}`);
        next.push(newUrl);
        changed = true;
      }
      converted++;
    } catch (err) {
      console.error(`FAILED ${label} ${doc._id} (${filename}): ${err.message} -- left pointing at the original file`);
      next.push(item);
      failed++;
    }
  }

  if (changed) doc[field] = Array.isArray(value) ? next : next[0];
  return changed;
};

const migrateModel = async (Model, fields, label) => {
  const docs = await Model.find();
  for (const doc of docs) {
    let changed = false;
    for (const field of fields) {
      if ((await migrateField(doc, field, `${label}.${field}`)) && !DRY_RUN) changed = true;
    }
    if (changed) await doc.save();
  }
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB. ${DRY_RUN ? "DRY RUN -- nothing will be written." : "LIVE RUN -- files will be converted and documents updated."}`);

  await migrateModel(Leader, ["photo"], "Leader");
  await migrateModel(BoardMember, ["photo"], "BoardMember");
  await migrateModel(Project, ["thumbnail", "images"], "Project");
  await migrateModel(News, ["image", "images"], "News");
  await migrateModel(Notice, ["images"], "Notice"); // "attachment" is a document field, not an image -- never touched
  await migrateModel(Album, ["coverImage", "photos"], "Album");
  await migrateModel(Event, ["image", "images"], "Event");
  await migrateModel(Story, ["photo", "images"], "Story");
  await migrateModel(Video, ["thumbnail"], "Video"); // "videoFile" is the video itself -- never touched

  console.log(`\nDone. Converted: ${converted}, failed: ${failed}.`);
  if (failed > 0) {
    console.log("Some items failed to convert -- their database fields were left untouched (still pointing at the original file), so nothing is broken. Re-running this script is safe; already-converted fields are skipped automatically.");
  }
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Migration crashed:", err);
  process.exit(1);
});
