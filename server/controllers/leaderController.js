import asyncHandler from "express-async-handler";
import Leader from "../models/Leader.js";

// Guarded partial update: only rebuilds a bilingual field if the caller
// actually sent something for it, so a partial PUT (e.g. just changing the
// photo) can never silently wipe out name/title/message.
const fromFlatFields = (body) => {
  const payload = {};
  if (body.role !== undefined) payload.role = body.role;
  if (body.order !== undefined) payload.order = Number(body.order) || 0;
  if (body.nameEn !== undefined || body.nameNe !== undefined) payload.name = { en: body.nameEn, ne: body.nameNe };
  if (body.titleEn !== undefined || body.titleNe !== undefined) payload.title = { en: body.titleEn, ne: body.titleNe };
  if (body.messageEn !== undefined || body.messageNe !== undefined) payload.message = { en: body.messageEn, ne: body.messageNe };
  return payload;
};

// @desc   List leadership team members, ordered for display
// @route  GET /api/leaders
export const getLeaders = asyncHandler(async (req, res) => {
  const leaders = await Leader.find().sort("order createdAt");
  res.json({ success: true, count: leaders.length, data: leaders });
});

// @desc   Get a single leader
// @route  GET /api/leaders/:id
export const getLeader = asyncHandler(async (req, res) => {
  const leader = await Leader.findById(req.params.id);
  if (!leader) {
    res.status(404);
    throw new Error("Leader not found");
  }
  res.json({ success: true, data: leader });
});

// @desc   Create a leader — photo (field "photo") required
// @route  POST /api/leaders
export const createLeader = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("A photo is required");
  }
  const payload = {
    role: req.body.role || "advisor",
    order: Number(req.body.order) || 0,
    name: { en: req.body.nameEn, ne: req.body.nameNe },
    title: { en: req.body.titleEn, ne: req.body.titleNe },
    message: { en: req.body.messageEn, ne: req.body.messageNe },
    photo: req.file.path,
  };
  const leader = await Leader.create(payload);
  res.status(201).json({ success: true, data: leader });
});

// @desc   Update a leader
// @route  PUT /api/leaders/:id
export const updateLeader = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.photo = req.file.path;

  const leader = await Leader.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!leader) {
    res.status(404);
    throw new Error("Leader not found");
  }
  res.json({ success: true, data: leader });
});

// @desc   Delete a leader
// @route  DELETE /api/leaders/:id
export const deleteLeader = asyncHandler(async (req, res) => {
  const leader = await Leader.findByIdAndDelete(req.params.id);
  if (!leader) {
    res.status(404);
    throw new Error("Leader not found");
  }
  res.json({ success: true, message: "Leader deleted" });
});
