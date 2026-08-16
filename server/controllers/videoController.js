import asyncHandler from "express-async-handler";
import Video from "../models/Video.js";

// Recognizes youtube.com/watch?v=, youtube.com/embed/, youtube.com/shorts/,
// youtube.com/live/, and youtu.be/ links — same 11-char video ID format
// across all of them. Keep this in sync with client/src/utils/videoEmbed.js's
// identical regex (client-side needs its own copy to build the iframe src).
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const youtubeThumbnail = (url) => {
  const match = url?.match(YOUTUBE_RE);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const fromFlatFields = (body) => ({
  ...(body.titleEn !== undefined || body.titleNe !== undefined ? { title: { en: body.titleEn, ne: body.titleNe } } : {}),
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn || "", ne: body.descriptionNe || "" } }
    : {}),
  ...(body.category ? { category: body.category } : {}),
  ...(body.duration !== undefined ? { duration: body.duration } : {}),
  ...(body.embedUrl !== undefined ? { embedUrl: body.embedUrl } : {}),
});

// @desc   List gallery videos, newest first. ?category=Event filters.
// @route  GET /api/videos
export const getVideos = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = {};
  if (category && category !== "All") query.category = category;

  const videos = await Video.find(query).sort("-createdAt");
  res.json({ success: true, count: videos.length, data: videos });
});

// @desc   Get a single video
// @route  GET /api/videos/:id
export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }
  res.json({ success: true, data: video });
});

// @desc   Create a gallery video — needs either an embed link (embedUrl) or
//         an uploaded file (field "video"); an uploaded thumbnail (field
//         "thumbnail") is optional and otherwise auto-derived from a
//         YouTube embedUrl.
// @route  POST /api/videos
export const createVideo = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (videoFile) payload.videoFile = videoFile.path;
  if (!payload.embedUrl && !payload.videoFile) {
    res.status(400);
    throw new Error("Provide either an embed link or upload a video file");
  }

  if (thumbnailFile) {
    payload.thumbnail = thumbnailFile.path;
  } else if (payload.embedUrl) {
    payload.thumbnail = youtubeThumbnail(payload.embedUrl) || "";
  }

  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const video = await Video.create(payload);
  res.status(201).json({ success: true, data: video });
});

// @desc   Update a gallery video
// @route  PUT /api/videos/:id
export const updateVideo = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (videoFile) payload.videoFile = videoFile.path;
  // Only touch `thumbnail` when a new file is actually uploaded here — the
  // admin form always resends embedUrl (even unchanged, e.g. editing just
  // the title), so re-deriving from it on every save would silently
  // overwrite a manually-uploaded custom thumbnail. Same guard rationale as
  // every other partial-update controller in this app.
  if (thumbnailFile) payload.thumbnail = thumbnailFile.path;

  const video = await Video.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }
  res.json({ success: true, data: video });
});

// @desc   Delete a gallery video
// @route  DELETE /api/videos/:id
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndDelete(req.params.id);
  if (!video) {
    res.status(404);
    throw new Error("Video not found");
  }
  res.json({ success: true, message: "Video deleted" });
});
