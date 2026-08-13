import mongoose from "mongoose";

// Matches src/data/content.js's `projects` shape — see models/News.js for
// why bilingual fields are stored as { en, ne }.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

const projectSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    description: { type: bilingual, required: true },
    status: { type: String, enum: ["ongoing", "completed"], default: "ongoing" },
    images: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
