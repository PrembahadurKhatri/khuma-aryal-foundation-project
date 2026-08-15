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
});

// @desc   List events, soonest first
// @route  GET /api/events
export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort("date");
  res.json({ success: true, count: events.length, data: events });
});

// @desc   Get a single event
// @route  GET /api/events/:id
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
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
  if (req.file) payload.image = req.file.path;
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const event = await Event.create(payload);
  res.status(201).json({ success: true, data: event });
});

// @desc   Update an event
// @route  PUT /api/events/:id
export const updateEvent = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.image = req.file.path;

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
