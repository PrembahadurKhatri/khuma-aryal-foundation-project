import mongoose from "mongoose";

// "Downloads" — useful documents (annual report, brochure, press release,
// registration form, newsletter) admins upload once and visitors download
// from the News page.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

export const DOWNLOAD_TYPES = ["AnnualReport", "Brochure", "PressRelease", "RegistrationForm", "Newsletter", "Other"];

const downloadSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    type: { type: String, enum: DOWNLOAD_TYPES, default: "Other" },
    // PDF/doc uploaded via the document upload pipeline — see
    // middleware/upload.js's `upload.document`.
    file: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

downloadSchema.index({ date: -1 });

export default mongoose.model("Download", downloadSchema);
