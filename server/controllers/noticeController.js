import asyncHandler from "express-async-handler";
import Notice from "../models/Notice.js";

const fromFlatFields = (body) => ({
  ...(body.titleEn !== undefined || body.titleNe !== undefined ? { title: { en: body.titleEn, ne: body.titleNe } } : {}),
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn || "", ne: body.descriptionNe || "" } }
    : {}),
  ...(body.date ? { date: body.date } : {}),
  ...(body.priority ? { priority: body.priority } : {}),
  // "" (the <select>'s "None" option) explicitly clears the link — only a
  // genuinely absent field leaves the existing album untouched.
  ...(body.album !== undefined ? { album: body.album || null } : {}),
});

// @desc   List notices, newest first
// @route  GET /api/notices
export const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find().sort("-date");
  res.json({ success: true, count: notices.length, data: notices });
});

// @desc   Get a single notice. `album` is populated (title/coverImage) so
//         the detail page can render a real preview card linking to that
//         album, not just a bare ID — same as projectController.js's getProject.
// @route  GET /api/notices/:id
export const getNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate("album", "title coverImage photos");
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
  if (req.files?.attachment?.[0]) payload.attachment = req.files.attachment[0].path;
  payload.images = (req.files?.images || []).map((f) => f.path);
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const notice = await Notice.create(payload);
  res.status(201).json({ success: true, data: notice });
});

// @desc   Update a notice. `keepImages` (JSON array of existing gallery
//         photo URLs the admin chose to keep) is merged with any newly
//         uploaded files — same guarded pattern as projectController.js's
//         updateProject.
// @route  PUT /api/notices/:id
export const updateNotice = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.files?.attachment?.[0]) payload.attachment = req.files.attachment[0].path;

  const uploadedImages = (req.files?.images || []).map((f) => f.path);
  if (req.body.keepImages !== undefined || uploadedImages.length > 0) {
    let keepImages = [];
    if (req.body.keepImages) {
      try {
        keepImages = JSON.parse(req.body.keepImages);
      } catch {
        keepImages = [];
      }
    }
    payload.images = [...keepImages, ...uploadedImages];
  }

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
