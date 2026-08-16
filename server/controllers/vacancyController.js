import asyncHandler from "express-async-handler";
import Vacancy from "../models/Vacancy.js";

const fromFlatFields = (body) => ({
  ...(body.titleEn !== undefined || body.titleNe !== undefined ? { title: { en: body.titleEn, ne: body.titleNe } } : {}),
  ...(body.descriptionEn !== undefined || body.descriptionNe !== undefined
    ? { description: { en: body.descriptionEn, ne: body.descriptionNe } }
    : {}),
  ...(body.type ? { type: body.type } : {}),
  ...(body.locationEn !== undefined || body.locationNe !== undefined
    ? { location: { en: body.locationEn || "", ne: body.locationNe || "" } }
    : {}),
  ...(body.requirementsEn !== undefined || body.requirementsNe !== undefined
    ? { requirements: { en: body.requirementsEn || "", ne: body.requirementsNe || "" } }
    : {}),
  ...(body.educationEn !== undefined || body.educationNe !== undefined
    ? { education: { en: body.educationEn || "", ne: body.educationNe || "" } }
    : {}),
  ...(body.deadline ? { deadline: body.deadline } : {}),
  ...(body.applyLink !== undefined ? { applyLink: body.applyLink } : {}),
});

// @desc   List job vacancies, soonest deadline first
// @route  GET /api/vacancies
export const getVacancies = asyncHandler(async (req, res) => {
  const vacancies = await Vacancy.find().sort("deadline");
  res.json({ success: true, count: vacancies.length, data: vacancies });
});

// @desc   Get a single vacancy
// @route  GET /api/vacancies/:id
export const getVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findById(req.params.id);
  if (!vacancy) {
    res.status(404);
    throw new Error("Vacancy not found");
  }
  res.json({ success: true, data: vacancy });
});

// @desc   Create a job vacancy
// @route  POST /api/vacancies
export const createVacancy = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);
  if (req.user?._id && req.user._id !== "local-fallback-admin") payload.createdBy = req.user._id;

  const vacancy = await Vacancy.create(payload);
  res.status(201).json({ success: true, data: vacancy });
});

// @desc   Update a job vacancy
// @route  PUT /api/vacancies/:id
export const updateVacancy = asyncHandler(async (req, res) => {
  const payload = fromFlatFields(req.body);

  const vacancy = await Vacancy.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!vacancy) {
    res.status(404);
    throw new Error("Vacancy not found");
  }
  res.json({ success: true, data: vacancy });
});

// @desc   Delete a job vacancy
// @route  DELETE /api/vacancies/:id
export const deleteVacancy = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findByIdAndDelete(req.params.id);
  if (!vacancy) {
    res.status(404);
    throw new Error("Vacancy not found");
  }
  res.json({ success: true, message: "Vacancy deleted" });
});
