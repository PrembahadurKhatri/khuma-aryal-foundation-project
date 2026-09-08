import asyncHandler from "express-async-handler";
import Story from "../models/Story.js";

const fromFlatFields = (body) => ({
  ...(body.nameEn !== undefined || body.nameNe !== undefined ? { name: { en: body.nameEn || "", ne: body.nameNe || "" } } : {}),
  summary: { en: body.summaryEn, ne: body.summaryNe },
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn || "", ne: body.descriptionNe || "" } }
    : {}),
  // "" (the <select>'s "None" option) explicitly clears the link — only a
  // genuinely absent field leaves the existing album untouched.
  ...(body.album !== undefined ? { album: body.album || null } : {}),
});

// @desc   List impact/success stories, newest first
// @route  GET /api/stories
export const getStories = asyncHandler(async (req, res) => {
  const stories = await Story.find().sort("-createdAt");
  res.json({ success: true, count: stories.length, data: stories });
});

// @desc   Get a single story. `album` is populated (title/coverImage) so
//         the detail page can render a real preview card linking to that
//         album, not just a bare ID — same as projectController.js's getProject.
// @route  GET /api/stories/:id
export const getStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id).populate("album", "title coverImage photos");
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }
  res.json({ success: true, data: story });
});

// @desc   Create a story — photo (field "photo") required
// @route  POST /api/stories
export const createStory = asyncHandler(async (req, res) => {
  if (!req.files?.photo?.[0]) {
    res.status(400);
    throw new Error("A photo is required");
  }
  const payload = { ...fromFlatFields(req.body), photo: req.files.photo[0].path };
  payload.images = (req.files?.images || []).map((f) => f.path);
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const story = await Story.create(payload);
  res.status(201).json({ success: true, data: story });
});

// @desc   Update a story. `keepImages` (JSON array of existing gallery photo
//         URLs the admin chose to keep) is merged with any newly uploaded
//         files — same guarded pattern as projectController.js's updateProject.
// @route  PUT /api/stories/:id
export const updateStory = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.files?.photo?.[0]) payload.photo = req.files.photo[0].path;

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

  const story = await Story.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }
  res.json({ success: true, data: story });
});

// @desc   Delete a story
// @route  DELETE /api/stories/:id
export const deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findByIdAndDelete(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }
  res.json({ success: true, message: "Story deleted" });
});
