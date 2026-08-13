import asyncHandler from "express-async-handler";
import Gallery from "../models/Gallery.js";

// @desc   List gallery images, newest first
// @route  GET /api/gallery
export const getGalleryImages = asyncHandler(async (req, res) => {
  const images = await Gallery.find().sort("-createdAt");
  res.json({ success: true, count: images.length, data: images });
});

// @desc   Upload a gallery image
// @route  POST /api/gallery
export const createGalleryImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Image file is required");
  }
  const image = await Gallery.create({
    src: req.file.path,
    alt: { en: req.body.altEn, ne: req.body.altNe },
    ...(req.user?._id && req.user._id !== "local-fallback-admin" ? { createdBy: req.user._id } : {}),
  });
  res.status(201).json({ success: true, data: image });
});

// @desc   Update a gallery image's caption (or replace the image)
// @route  PUT /api/gallery/:id
export const updateGalleryImage = asyncHandler(async (req, res) => {
  const payload = { alt: { en: req.body.altEn, ne: req.body.altNe } };
  if (req.file) payload.src = req.file.path;

  const image = await Gallery.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!image) {
    res.status(404);
    throw new Error("Gallery image not found");
  }
  res.json({ success: true, data: image });
});

// @desc   Delete a gallery image
// @route  DELETE /api/gallery/:id
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findByIdAndDelete(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error("Gallery image not found");
  }
  res.json({ success: true, message: "Gallery image deleted" });
});
