import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";

const fromFlatFields = (body) => ({
  title: { en: body.titleEn, ne: body.titleNe },
  description: { en: body.descriptionEn, ne: body.descriptionNe },
  ...(body.status ? { status: body.status } : {}),
});

// @desc   List projects (optional ?status=ongoing|completed)
// @route  GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const projects = await Project.find(query).sort("-createdAt");
  res.json({ success: true, count: projects.length, data: projects });
});

// @desc   Get a single project
// @route  GET /api/projects/:id
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ success: true, data: project });
});

// @desc   Create a project
// @route  POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  const uploaded = (req.files || []).map((f) => f.path);
  payload.images = uploaded;
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const project = await Project.create(payload);
  res.status(201).json({ success: true, data: project });
});

// @desc   Update a project. `keepImages` (JSON array of existing URLs the
//         admin chose to keep) is merged with any newly uploaded files.
// @route  PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);

  let keepImages = [];
  if (req.body.keepImages) {
    try {
      keepImages = JSON.parse(req.body.keepImages);
    } catch {
      keepImages = [];
    }
  }
  const uploaded = (req.files || []).map((f) => f.path);
  payload.images = [...keepImages, ...uploaded];

  const project = await Project.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ success: true, data: project });
});

// @desc   Delete a project
// @route  DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json({ success: true, message: "Project deleted" });
});
