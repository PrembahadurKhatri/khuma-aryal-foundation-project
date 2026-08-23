import asyncHandler from "express-async-handler";
import News from "../models/News.js";

// Admin forms submit bilingual fields as flat keys (titleEn/titleNe/...)
// rather than nested "title[en]" — multipart/form-data (multer) doesn't
// auto-parse bracket notation into nested objects the way Express's
// urlencoded parser does, so this is the simplest reliable wire format.
// title/description are guarded (only rebuilt if actually sent) the same
// way every other controller in this app is — see Project/Album's
// identical fromFlatFields — so a partial update (e.g. category-only)
// can't blank out required fields and fail validation.
const fromFlatFields = (body) => ({
  ...(body.titleEn !== undefined || body.titleNe !== undefined ? { title: { en: body.titleEn, ne: body.titleNe } } : {}),
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn, ne: body.descriptionNe } }
    : {}),
  ...(body.date ? { date: body.date } : {}),
  ...(body.category ? { category: body.category } : {}),
  // "" (the <select>'s "None" option) explicitly clears the link — only a
  // genuinely absent field leaves the existing album untouched.
  ...(body.album !== undefined ? { album: body.album || null } : {}),
});

// @desc   List news/notices, newest first
// @route  GET /api/news
export const getNews = asyncHandler(async (req, res) => {
  const news = await News.find().sort("-date");
  res.json({ success: true, count: news.length, data: news });
});

// @desc   Get a single news item. `album` is populated (title/coverImage) so
//         the detail page can render a real preview card linking to that
//         album, not just a bare ID — same as projectController.js's getProject.
// @route  GET /api/news/:id
export const getNewsItem = asyncHandler(async (req, res) => {
  const item = await News.findById(req.params.id).populate("album", "title coverImage photos");
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
  if (req.files?.image?.[0]) payload.image = req.files.image[0].path;
  payload.images = (req.files?.images || []).map((f) => f.path);
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const item = await News.create(payload);
  res.status(201).json({ success: true, data: item });
});

// @desc   Update a news/notice item. `keepImages` (JSON array of existing
//         gallery photo URLs the admin chose to keep) is merged with any
//         newly uploaded files — same guarded pattern as
//         projectController.js's updateProject.
// @route  PUT /api/news/:id
export const updateNews = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.files?.image?.[0]) payload.image = req.files.image[0].path;

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
