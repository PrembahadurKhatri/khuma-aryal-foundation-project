import asyncHandler from "express-async-handler";
import Story from "../models/Story.js";

const fromFlatFields = (body) => ({
  ...(body.name !== undefined ? { name: body.name } : {}),
  summary: { en: body.summaryEn, ne: body.summaryNe },
});

// @desc   List impact/success stories, newest first
// @route  GET /api/stories
export const getStories = asyncHandler(async (req, res) => {
  const stories = await Story.find().sort("-createdAt");
  res.json({ success: true, count: stories.length, data: stories });
});

// @desc   Get a single story
// @route  GET /api/stories/:id
export const getStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }
  res.json({ success: true, data: story });
});

// @desc   Create a story — photo (field "photo") required
// @route  POST /api/stories
export const createStory = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("A photo is required");
  }
  const payload = { ...fromFlatFields(req.body), photo: req.file.path };
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const story = await Story.create(payload);
  res.status(201).json({ success: true, data: story });
});

// @desc   Update a story
// @route  PUT /api/stories/:id
export const updateStory = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.photo = req.file.path;

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
