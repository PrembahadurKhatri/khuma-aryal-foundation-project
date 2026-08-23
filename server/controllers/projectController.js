import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";

// `title` and `description` are both always required on Project (the schema
// enforces it) and the admin form always submits both together on every
// save, so rebuilding them unconditionally is fine there — but any OTHER
// caller (e.g. an image-only update) that omits them would otherwise blank
// out the description or fail validation entirely. Every field here is
// guarded the same way, so a partial update can never silently wipe a
// field it didn't mean to touch.
const fromFlatFields = (body) => ({
  ...(body.titleEn !== undefined || body.titleNe !== undefined ? { title: { en: body.titleEn, ne: body.titleNe } } : {}),
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn, ne: body.descriptionNe } }
    : {}),
  ...(body.status ? { status: body.status } : {}),
  ...(body.category ? { category: body.category } : {}),
  ...(body.date ? { date: body.date } : {}),
  // "" clears a previously-set finish date (a project that had one can go
  // back to open-ended) — only a genuinely absent field leaves it untouched.
  ...(body.endDate !== undefined ? { endDate: body.endDate || null } : {}),
  ...(body.durationEn !== undefined || body.durationNe !== undefined
    ? { duration: { en: body.durationEn || "", ne: body.durationNe || "" } }
    : {}),
  ...(body.locationEn !== undefined || body.locationNe !== undefined
    ? { location: { en: body.locationEn || "", ne: body.locationNe || "" } }
    : {}),
  ...(body.beneficiariesEn !== undefined || body.beneficiariesNe !== undefined
    ? { beneficiaries: { en: body.beneficiariesEn || "", ne: body.beneficiariesNe || "" } }
    : {}),
  ...(body.objectiveEn !== undefined || body.objectiveNe !== undefined
    ? { objective: { en: body.objectiveEn || "", ne: body.objectiveNe || "" } }
    : {}),
  // "" (the <select>'s "None" option) explicitly clears the link — only a
  // genuinely absent field leaves the existing album untouched.
  ...(body.album !== undefined ? { album: body.album || null } : {}),
  ...(body.featured !== undefined ? { featured: body.featured === true || body.featured === "true" } : {}),
});

// @desc   List projects. ?status=ongoing|completed|upcoming and
//         ?category=Event (etc, same list as gallery Albums) both filter;
//         sort=oldest reverses the default newest-first order.
// @route  GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const { status, category, sort } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category && category !== "All") query.category = category;

  const projects = await Project.find(query).sort(sort === "oldest" ? "createdAt" : "-createdAt");
  res.json({ success: true, count: projects.length, data: projects });
});

// @desc   Get a single project. `album` is populated (title/coverImage) so
//         the project detail page can render a real preview card linking
//         to that album, not just a bare ID.
// @route  GET /api/projects/:id
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate("album", "title coverImage photos");
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
  // req.files is now keyed by field ({ images: [...], thumbnail: [...] })
  // since the route uses upload.fields() to accept both together.
  const uploaded = (req.files?.images || []).map((f) => f.path);
  payload.images = uploaded;
  payload.thumbnail = req.files?.thumbnail?.[0]?.path || "";
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const project = await Project.create(payload);
  res.status(201).json({ success: true, data: project });
});

// @desc   Update a project. `keepImages` (JSON array of existing URLs the
//         admin chose to keep) is merged with any newly uploaded files.
// @route  PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);

  // Only touch `images` if this request actually said something about them
  // (the admin form always sends keepImages, even as "[]") — otherwise a
  // caller updating just one other field (e.g. duration) would silently
  // wipe every existing image. Same guard rationale as title/description/etc above.
  const uploaded = (req.files?.images || []).map((f) => f.path);
  if (req.body.keepImages !== undefined || uploaded.length > 0) {
    let keepImages = [];
    if (req.body.keepImages) {
      try {
        keepImages = JSON.parse(req.body.keepImages);
      } catch {
        keepImages = [];
      }
    }
    payload.images = [...keepImages, ...uploaded];
  }

  // Same guard for the dedicated thumbnail: only touch it if a new file was
  // uploaded or the admin form explicitly said something about the existing
  // one (keepThumbnail, possibly "" to clear it after removing it in the UI).
  const uploadedThumbnail = req.files?.thumbnail?.[0]?.path;
  if (req.body.keepThumbnail !== undefined || uploadedThumbnail) {
    payload.thumbnail = uploadedThumbnail || req.body.keepThumbnail || "";
  }

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
