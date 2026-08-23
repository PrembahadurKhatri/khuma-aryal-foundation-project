import mongoose from "mongoose";

// "Impact / Success Stories" — a beneficiary's story, shown as a photo +
// short summary card with a Read More expand on the public News page.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

const storySchema = new mongoose.Schema(
  {
    // Plain string, not bilingual — a person's name reads the same in
    // either language. Optional per spec ("Name (optional)").
    name: { type: String, trim: true, default: "" },
    summary: { type: bilingual, required: true },
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
