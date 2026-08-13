import asyncHandler from "express-async-handler";
import News from "../models/News.js";

// Admin forms submit bilingual fields as flat keys (titleEn/titleNe/...)
// rather than nested "title[en]" — multipart/form-data (multer) doesn't
// auto-parse bracket notation into nested objects the way Express's
// urlencoded parser does, so this is the simplest reliable wire format.
const fromFlatFields = (body) => ({
  title: { en: body.titleEn, ne: body.titleNe },
  description: { en: body.descriptionEn, ne: body.descriptionNe },
  ...(body.date ? { date: body.date } : {}),
});

// @desc   List news/notices, newest first
// @route  GET /api/news
export const getNews = asyncHandler(async (req, res) => {
  const news = await News.find().sort("-date");
  res.json({ success: true, count: news.length, data: news });
});

// @desc   Get a single news item
// @route  GET /api/news/:id
export const getNewsItem = asyncHandler(async (req, res) => {
  const item = await News.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("News item not found");
  }
  res.json({ success: true, data: item });
});

// @desc   Create a news/notice item
// @route  POST /api/news
export const createNews = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.image = req.file.path;
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const item = await News.create(payload);
  res.status(201).json({ success: true, data: item });
});

// @desc   Update a news/notice item
// @route  PUT /api/news/:id
export const updateNews = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.image = req.file.path;

  const item = await News.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!item) {
    res.status(404);
    throw new Error("News item not found");
  }
  res.json({ success: true, data: item });
});

// @desc   Delete a news/notice item
// @route  DELETE /api/news/:id
export const deleteNews = asyncHandler(async (req, res) => {
  const item = await News.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("News item not found");
  }
  res.json({ success: true, message: "News item deleted" });
});
