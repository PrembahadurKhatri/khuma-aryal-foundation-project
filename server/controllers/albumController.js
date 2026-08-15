import asyncHandler from "express-async-handler";
import Album from "../models/Album.js";

// `title` is always required (the schema enforces it), so it's fine to
// always rebuild it from the flat fields — the admin form always submits
// both together. `description` and `category` are optional/guarded instead:
// an update call that only touches photos (like the keepPhotos-only path)
// shouldn't silently blank out the description or reset the category just
// because it didn't resend them.
const fromFlatFields = (body) => ({
  title: { en: body.titleEn, ne: body.titleNe },
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn || "", ne: body.descriptionNe || "" } }
    : {}),
  ...(body.category ? { category: body.category } : {}),
});

// @desc   List albums, newest first. ?category=Event filters; sort=oldest
//         reverses the default newest-first order (Gallery.jsx's "Latest
//         First" / "Oldest First" control).
// @route  GET /api/gallery
export const getAlbums = asyncHandler(async (req, res) => {
  const { category, sort } = req.query;
  const query = {};
  if (category && category !== "All") query.category = category;

  const albums = await Album.find(query).sort(sort === "oldest" ? "createdAt" : "-createdAt");
  res.json({ success: true, count: albums.length, data: albums });
});

// @desc   Get a single album with all its photos
// @route  GET /api/gallery/:id
export const getAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id);
  if (!album) {
    res.status(404);
    throw new Error("Album not found");
  }
  res.json({ success: true, data: album });
});

// @desc   Create an album — cover image (field "cover", single) required,
//         additional photos (field "photos", multiple) optional at creation
//         and addable later via updateAlbum.
// @route  POST /api/gallery
export const createAlbum = asyncHandler(async (req, res) => {
  const cover = req.files?.cover?.[0];
  if (!cover) {
    res.status(400);
    throw new Error("A cover image is required");
  }
  const photos = (req.files?.photos || []).map((f) => f.path);

  const payload = {
    ...fromFlatFields(req.body),
    coverImage: cover.path,
    photos,
  };
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const album = await Album.create(payload);
  res.status(201).json({ success: true, data: album });
});

// @desc   Update an album's title, optionally replace the cover, and
//         merge `keepPhotos` (JSON array of existing photo URLs the admin
//         chose to keep) with any newly uploaded photos.
// @route  PUT /api/gallery/:id
export const updateAlbum = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);

  const cover = req.files?.cover?.[0];
  if (cover) payload.coverImage = cover.path;

  // Only touch `photos` if this request actually said something about them
  // (the admin form always sends keepPhotos, even as "[]") — otherwise a
  // caller updating just the title/category/etc would silently wipe every
  // photo already in the album. Same guard rationale as fromFlatFields above.
  const uploadedPhotos = (req.files?.photos || []).map((f) => f.path);
  if (req.body.keepPhotos !== undefined || uploadedPhotos.length > 0) {
    let keepPhotos = [];
    if (req.body.keepPhotos) {
      try {
        keepPhotos = JSON.parse(req.body.keepPhotos);
      } catch {
        keepPhotos = [];
      }
    }
    payload.photos = [...keepPhotos, ...uploadedPhotos];
  }

  const album = await Album.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!album) {
    res.status(404);
    throw new Error("Album not found");
  }
  res.json({ success: true, data: album });
});

// @desc   Delete an album (and all its photos with it)
// @route  DELETE /api/gallery/:id
export const deleteAlbum = asyncHandler(async (req, res) => {
  const album = await Album.findByIdAndDelete(req.params.id);
  if (!album) {
    res.status(404);
    throw new Error("Album not found");
  }
  res.json({ success: true, message: "Album deleted" });
});
