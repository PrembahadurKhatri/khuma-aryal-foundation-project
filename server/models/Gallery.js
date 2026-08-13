import mongoose from "mongoose";

// Matches src/data/content.js's `galleryImages` shape ({ src, alt: { en, ne } }).
const gallerySchema = new mongoose.Schema(
  {
    src: { type: String, required: true },
    alt: {
      en: { type: String, required: true, trim: true },
      ne: { type: String, required: true, trim: true },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
