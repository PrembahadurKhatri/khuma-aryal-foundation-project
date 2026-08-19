import asyncHandler from "express-async-handler";
import BoardMember from "../models/BoardMember.js";

// Guarded partial update: only rebuilds a bilingual field if the caller
// actually sent something for it, so a partial PUT (e.g. just changing the
// photo) can never silently wipe out name/designation. Same pattern as
// leaderController.js's fromFlatFields.
const fromFlatFields = (body) => {
  const payload = {};
  if (body.order !== undefined) payload.order = Number(body.order) || 0;
  if (body.nameEn !== undefined || body.nameNe !== undefined) payload.name = { en: body.nameEn, ne: body.nameNe };
  if (body.designationEn !== undefined || body.designationNe !== undefined)
    payload.designation = { en: body.designationEn, ne: body.designationNe };
  return payload;
};

// @desc   List board members, ordered for display
// @route  GET /api/board-members
export const getBoardMembers = asyncHandler(async (req, res) => {
  const members = await BoardMember.find().sort("order createdAt");
  res.json({ success: true, count: members.length, data: members });
});

// @desc   Get a single board member
// @route  GET /api/board-members/:id
export const getBoardMember = asyncHandler(async (req, res) => {
  const member = await BoardMember.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Board member not found");
  }
  res.json({ success: true, data: member });
});

// @desc   Create a board member — photo (field "photo") required
// @route  POST /api/board-members
export const createBoardMember = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("A photo is required");
  }
  const payload = {
    order: Number(req.body.order) || 0,
    name: { en: req.body.nameEn, ne: req.body.nameNe },
    designation: { en: req.body.designationEn, ne: req.body.designationNe },
    photo: req.file.path,
  };
  const member = await BoardMember.create(payload);
  res.status(201).json({ success: true, data: member });
});

// @desc   Update a board member
// @route  PUT /api/board-members/:id
export const updateBoardMember = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.file) payload.photo = req.file.path;

  const member = await BoardMember.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!member) {
    res.status(404);
    throw new Error("Board member not found");
  }
  res.json({ success: true, data: member });
});

// @desc   Delete a board member
// @route  DELETE /api/board-members/:id
export const deleteBoardMember = asyncHandler(async (req, res) => {
  const member = await BoardMember.findByIdAndDelete(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error("Board member not found");
  }
  res.json({ success: true, message: "Board member deleted" });
});
