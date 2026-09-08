import mongoose from "mongoose";

// "Impact / Success Stories" — a beneficiary's story, shown as a photo +
// short summary card with a Read More expand on the public News page.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };
const optionalBilingual = { en: { type: String, trim: true, default: "" }, ne: { type: String, trim: true, default: "" } };

const storySchema = new mongoose.Schema(
  {
    // Bilingual — a name can be spelled differently in Nepali script, so
    // (unlike most "plain string" fields) this isn't the same in both
    // languages. Optional per spec ("Name (optional)").
    name: { type: optionalBilingual, default: () => ({}) },
    summary: { type: bilingual, required: true },
    // The short blurb (`summary`) is what shows, truncated, on the card.
    // This is the full write-up shown on the story's own detail page —
    // optional so existing stories that only ever had a summary still work,
    // falling back to just showing the summary there.
    description: { type: optionalBilingual, default: () => ({}) },
    photo: { type: String, required: true },
    // Additional photos for this story's own detail page gallery (up to 6)
    // plus an optional link to a full Gallery Album — same pattern as
    // models/Project.js's images/album.
    images: [{ type: String }],
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
