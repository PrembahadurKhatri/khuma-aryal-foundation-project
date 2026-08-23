import mongoose from "mongoose";

// "Upcoming Events" — distinct from Project (which is a whole ongoing
// program) and News (a write-up): a single dated happening with a time,
// place, and an optional registration link.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };
const optionalBilingual = { en: { type: String, trim: true, default: "" }, ne: { type: String, trim: true, default: "" } };

const eventSchema = new mongoose.Schema(
  {
    name: { type: bilingual, required: true },
    date: { type: Date, required: true },
    // Free text on purpose (e.g. "10:00 AM - 2:00 PM") rather than a strict
    // time type — a clock time reads the same in English and Nepali digits
    // aren't required, so this isn't a bilingual field.
    time: { type: String, trim: true, default: "" },
    location: { type: optionalBilingual, default: () => ({}) },
    // External registration link (Google Form, etc.) the "Register" button
    // opens in a new tab. Left empty, the card just doesn't show a button.
    registerLink: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },
    // Additional photos for this event's own detail page gallery (up to 6)
    // plus an optional link to a full Gallery Album — same pattern as
    // models/Project.js's images/album.
    images: [{ type: String }],
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

eventSchema.index({ date: 1 });

export default mongoose.model("Event", eventSchema);
