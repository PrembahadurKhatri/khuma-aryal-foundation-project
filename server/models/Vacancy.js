import mongoose from "mongoose";

// "Job Vacancy" — open positions posted on the News page, distinct from
// Notice (general announcements) since a vacancy carries its own
// deadline/employment-type/apply-link shape.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };
const optionalBilingual = { en: { type: String, trim: true, default: "" }, ne: { type: String, trim: true, default: "" } };

export const VACANCY_TYPES = ["FullTime", "PartTime", "Volunteer", "Internship", "Contract"];

const vacancySchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    description: { type: bilingual, required: true },
    type: { type: String, enum: VACANCY_TYPES, default: "FullTime" },
    location: { type: optionalBilingual, default: () => ({}) },
    // Free text, one item per line — rendered as a bulleted list on
    // VacancyDetail.jsx. Both optional since not every posting needs them
    // spelled out separately from the main description.
    requirements: { type: optionalBilingual, default: () => ({}) },
    education: { type: optionalBilingual, default: () => ({}) },
    deadline: { type: Date, required: true },
    // External application link (Google Form, mailto:, etc.) the "Apply
    // Now" button opens. Left empty, the card just doesn't show a button.
    applyLink: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

vacancySchema.index({ deadline: 1 });

export default mongoose.model("Vacancy", vacancySchema);
