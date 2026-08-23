import asyncHandler from "express-async-handler";
import Event from "../models/Event.js";

const fromFlatFields = (body) => ({
  name: { en: body.nameEn, ne: body.nameNe },
  ...(body.date ? { date: body.date } : {}),
  ...(body.time !== undefined ? { time: body.time } : {}),
  ...(body.locationEn !== undefined || body.locationNe !== undefined
    ? { location: { en: body.locationEn || "", ne: body.locationNe || "" } }
    : {}),
  ...(body.registerLink !== undefined ? { registerLink: body.registerLink } : {}),
  // "" (the <select>'s "None" option) explicitly clears the link — only a
  // genuinely absent field leaves the existing album untouched.
  ...(body.album !== undefined ? { album: body.album || null } : {}),
});

// @desc   List events, soonest first
// @route  GET /api/events
export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort("date");
  res.json({ success: true, count: events.length, data: events });
});

// @desc   Get a single event. `album` is populated (title/coverImage) so
//         the detail page can render a real preview card linking to that
//         album, not just a bare ID — same as projectController.js's getProject.
// @route  GET /api/events/:id
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate("album", "title coverImage photos");
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, data: event });
});

// @desc   Create an event — image (field "image") optional
// @route  POST /api/events
export const createEvent = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.files?.image?.[0]) payload.image = req.files.image[0].path;
  payload.images = (req.files?.images || []).map((f) => f.path);
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const event = await Event.create(payload);
  res.status(201).json({ success: true, data: event });
});

// @desc   Update an event. `keepImages` (JSON array of existing gallery
//         photo URLs the admin chose to keep) is merged with any newly
//         uploaded files — same guarded pattern as projectController.js's
//         updateProject.
// @route  PUT /api/events/:id
export const updateEvent = asyncHandler(async (req, res) => {
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

  const event = await Event.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, data: event });
});

// @desc   Delete an event
// @route  DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, message: "Event deleted" });
});
