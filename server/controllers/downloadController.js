import asyncHandler from "express-async-handler";
import Download from "../models/Download.js";

const fromFlatFields = (body) => ({
  title: { en: body.titleEn, ne: body.titleNe },
  ...(body.type ? { type: body.type } : {}),
  ...(body.date ? { date: body.date } : {}),
});

// @desc   List downloadable documents, newest first
// @route  GET /api/downloads
export const getDownloads = asyncHandler(async (req, res) => {
  const downloads = await Download.find().sort("-date");
  res.json({ success: true, count: downloads.length, data: downloads });
});

// @desc   Get a single download
// @route  GET /api/downloads/:id
export const getDownload = asyncHandler(async (req, res) => {
  const item = await Download.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Download not found");
  }
  res.json({ success: true, data: item });
});

// @desc   Create a download — file (field "file") required
// @route  POST /api/downloads
export const createDownload = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("A file is required");
  }
  const payload = { ...fromFlatFields(req.body), file: req.file.path };
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const item = await Download.create(payload);
  res.status(201).json({ success: true, data: item });
});

// @desc   Update a download
// @route  PUT /api/downloads/:id
export const updateDownload = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.file = req.file.path;

  const item = await Download.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!item) {
    res.status(404);
    throw new Error("Download not found");
  }
  res.json({ success: true, data: item });
});

// @desc   Delete a download
// @route  DELETE /api/downloads/:id
export const deleteDownload = asyncHandler(async (req, res) => {
  const item = await Download.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Download not found");
  }
  res.json({ success: true, message: "Download deleted" });
});
