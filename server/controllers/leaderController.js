import asyncHandler from "express-async-handler";
import Leader from "../models/Leader.js";
import { clearCache } from "../middleware/cache.js";

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
  // Rebuilt as a whole whenever any one social field is sent — admin's
  // form always submits all five together, so this also correctly clears
  // whichever of the five were left blank rather than leaving stale values.
  if (
    body.socialFacebook !== undefined ||
    body.socialInstagram !== undefined ||
    body.socialWhatsapp !== undefined ||
    body.socialEmail !== undefined ||
    body.socialTiktok !== undefined
  ) {
    payload.social = {
      facebook: body.socialFacebook || "",
      instagram: body.socialInstagram || "",
      whatsapp: body.socialWhatsapp || "",
      email: body.socialEmail || "",
      tiktok: body.socialTiktok || "",
    };
  }
  return payload;
};

// @desc   List leadership team members, ordered for display
// @route  GET /api/leaders
export const getLeaders = asyncHandler(async (req, res) => {
  // .select("-__v") drops the one field this list never uses;
  // .lean() skips building full Mongoose documents since this response is
  // read-only JSON -- no .save()/virtuals needed on the way out.
  const leaders = await Leader.find().select("-__v").sort("order createdAt").lean();
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
  // Photo is optional — falls back to a generic silhouette (same asset the
  // public site's own PlaceholderImage/Avatar fallbacks use) so an admin
  // can add a leader before a real photo is ready, instead of being
  // blocked entirely.
  const payload = {
    role: req.body.role || "advisor",
    order: Number(req.body.order) || 0,
    name: { en: req.body.nameEn, ne: req.body.nameNe },
    title: { en: req.body.titleEn, ne: req.body.titleNe },
    message: { en: req.body.messageEn, ne: req.body.messageNe },
    social: {
      facebook: req.body.socialFacebook || "",
      instagram: req.body.socialInstagram || "",
      whatsapp: req.body.socialWhatsapp || "",
      email: req.body.socialEmail || "",
      tiktok: req.body.socialTiktok || "",
    },
    photo: req.file ? req.file.path : "/images/blank.avif",
  };
  const leader = await Leader.create(payload);
  clearCache("leaders");
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
  clearCache("leaders");
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
  clearCache("leaders");
  res.json({ success: true, message: "Leader deleted" });
});
