import asyncHandler from "express-async-handler";
import Notice from "../models/Notice.js";

const fromFlatFields = (body) => ({
  ...(body.titleEn !== undefined || body.titleNe !== undefined ? { title: { en: body.titleEn, ne: body.titleNe } } : {}),
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn || "", ne: body.descriptionNe || "" } }
    : {}),
  ...(body.date ? { date: body.date } : {}),
  ...(body.priority ? { priority: body.priority } : {}),
});

// @desc   List notices, newest first
// @route  GET /api/notices
export const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find().sort("-date");
  res.json({ success: true, count: notices.length, data: notices });
});

// @desc   Get a single notice
// @route  GET /api/notices/:id
export const getNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) {
    res.status(404);
    throw new Error("Notice not found");
  }
  res.json({ success: true, data: notice });
});

// @desc   Create a notice — attachment (field "attachment") optional
// @route  POST /api/notices
export const createNotice = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.attachment = req.file.path;
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const notice = await Notice.create(payload);
  res.status(201).json({ success: true, data: notice });
});

// @desc   Update a notice
// @route  PUT /api/notices/:id
export const updateNotice = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.attachment = req.file.path;

  const notice = await Notice.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!notice) {
    res.status(404);
    throw new Error("Notice not found");
  }
  res.json({ success: true, data: notice });
});

// @desc   Delete a notice
// @route  DELETE /api/notices/:id
export const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) {
    res.status(404);
    throw new Error("Notice not found");
  }
  res.json({ success: true, message: "Notice deleted" });
});
