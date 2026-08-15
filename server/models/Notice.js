import mongoose from "mongoose";

// "Important Notices" — office/holiday/scholarship/registration-style
// announcements, distinct from News (which is closer to activity write-ups).
// Kept as its own model rather than a News subtype so admins get a purpose-
// built form (priority badge, attachment) instead of unused News fields.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

export const NOTICE_PRIORITIES = ["important", "new", "urgent"];

const noticeSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    date: { type: Date, required: true, default: Date.now },
    priority: { type: String, enum: NOTICE_PRIORITIES, default: "important" },
    // Optional PDF/doc uploaded via the document upload pipeline (see
    // middleware/upload.js's `upload.document`) — a plain URL, same as
    // every other uploaded-asset field in this app.
    attachment: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

noticeSchema.index({ date: -1 });

export default mongoose.model("Notice", noticeSchema);
