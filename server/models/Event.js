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
    // Full write-up shown on the event's own detail page, below the
    // date/time/location — same optional-bilingual shape as `location`.
    description: { type: optionalBilingual, default: () => ({}) },
    // Legacy field from when cards had a "Register" button linking out to an
    // external form. The button was removed in favor of a single "Read
    // More" link to the full detail page; left here (unused, no longer
    // collected by the admin form) only so any pre-existing value on old
    // documents isn't silently dropped.
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
