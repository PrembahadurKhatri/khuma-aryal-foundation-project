// One-time migration: downloads every Cloudinary-hosted file referenced in
// the database and saves it into server/uploads/ (the same local-disk
// storage middleware/upload.js already falls back to whenever Cloudinary
// isn't configured), then points each document at the new local URL
// instead. Additive only -- never deletes anything from Cloudinary or from
// the database, so the original Cloudinary copies stay untouched as a
// fallback the whole time. Safe to re-run: already-local URLs are skipped,
// and any single item that fails to download is logged and left pointing
// at its original Cloudinary URL rather than aborting the run.
//
// Run this ON THE LIVE SERVER (not locally) -- that's what makes the
// downloaded files land in ITS server/uploads/ folder, and it already has
// the right MONGO_URI in its environment.
//
//   DRY_RUN=1 node scripts/migrateCloudinaryToLocal.js   -- prints what would change, touches nothing
//   node scripts/migrateCloudinaryToLocal.js             -- does the real migration
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import Leader from "../models/Leader.js";
import BoardMember from "../models/BoardMember.js";
import Project from "../models/Project.js";
import News from "../models/News.js";
import Notice from "../models/Notice.js";
import Album from "../models/Album.js";
import Event from "../models/Event.js";
import Story from "../models/Story.js";
import Video from "../models/Video.js";
import Download from "../models/Download.js";
import JobApplication from "../models/JobApplication.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Matches the shape middleware/upload.js's normalizePaths already builds
// for local-disk uploads -- override with API_ORIGIN=... if this is ever
// run somewhere other than the live api. subdomain.
const API_ORIGIN = process.env.API_ORIGIN || "https://api.khumaaryalfoundation.org.np";

const DRY_RUN = process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");

let migrated = 0;
let failed = 0;

const isCloudinaryUrl = (v) => typeof v === "string" && v.startsWith("https://res.cloudinary.com/");

const downloadToLocal = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = path.extname(new URL(url).pathname) || "";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), buf);
  return `${API_ORIGIN}/uploads/${filename}`;
};

// One string field, or one array-of-strings field -- migrates every
// Cloudinary entry found, leaves everything else (local paths, empty
// strings, non-Cloudinary URLs) exactly as-is. Mutates `doc[field]`
// in place for whatever actually changed; returns whether it did.
const migrateField = async (doc, field, label) => {
  const value = doc[field];
  const items = Array.isArray(value) ? value : [value];
  let changed = false;
  const next = [];

  for (const item of items) {
    if (!isCloudinaryUrl(item)) {
      next.push(item);
      continue;
    }
    try {
      if (DRY_RUN) {
        console.log(`[dry-run] would migrate ${label} ${doc._id}: ${item}`);
        next.push(item);
      } else {
        const newUrl = await downloadToLocal(item);
        console.log(`migrated ${label} ${doc._id}: ${item} -> ${newUrl}`);
        next.push(newUrl);
        changed = true;
      }
      migrated++;
    } catch (err) {
      console.error(`FAILED ${label} ${doc._id} (${item}): ${err.message} -- left pointing at the original Cloudinary URL`);
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
  console.log(`Connected to MongoDB. ${DRY_RUN ? "DRY RUN -- nothing will be written." : "LIVE RUN -- files will be downloaded and documents updated."}`);

  await migrateModel(Leader, ["photo"], "Leader");
  await migrateModel(BoardMember, ["photo"], "BoardMember");
  await migrateModel(Project, ["thumbnail", "images"], "Project");
  await migrateModel(News, ["image", "images"], "News");
  await migrateModel(Notice, ["attachment", "images"], "Notice");
  await migrateModel(Album, ["coverImage", "photos"], "Album");
  await migrateModel(Event, ["image", "images"], "Event");
  await migrateModel(Story, ["photo", "images"], "Story");
  await migrateModel(Video, ["videoFile", "thumbnail"], "Video");
  await migrateModel(Download, ["file"], "Download");
  await migrateModel(JobApplication, ["coverLetter", "resume"], "JobApplication");

  console.log(`\nDone. Migrated: ${migrated}, failed: ${failed}.`);
  if (failed > 0) {
    console.log("Some items failed to download -- their database fields were left untouched (still pointing at Cloudinary), so nothing is broken. Re-running this script is safe; already-migrated fields are skipped automatically.");
  }
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Migration crashed:", err);
  process.exit(1);
});
