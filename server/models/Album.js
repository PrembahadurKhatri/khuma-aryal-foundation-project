import mongoose from "mongoose";

// A gallery "album": one cover photo + title (+ category + short
// description) shown as a thumbnail card on the public Gallery page,
// expanding to show every photo in `photos` when opened.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };
// Same shape but optional — used for `description`, which existing albums
// (seeded before this field existed) don't have yet.
const optionalBilingual = { en: { type: String, trim: true, default: "" }, ne: { type: String, trim: true, default: "" } };

// Matches the filter pills on the public Gallery page (Gallery.jsx).
// NOTE: "DisasterRelief" has no space on purpose — these values get
// interpolated straight into a translation key (`gallery.category${value}`,
// see Gallery.jsx/AlbumCard.jsx), and a space there breaks that lookup the
// same way it did for the home-hero pillar keys earlier. The translated
// display text ("Disaster Relief") still has the space — that only lives
// in translations.js.
export const ALBUM_CATEGORIES = ["Event", "Education", "Health", "Community", "Distribution", "DisasterRelief"];

const albumSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    description: { type: optionalBilingual, default: () => ({}) },
    category: { type: String, enum: ALBUM_CATEGORIES, default: "Event" },
    coverImage: { type: String, required: true },
    photos: [{ type: String }],
    // How many people this album's work reached — a plain number (not text)
    // so it can be rendered as "200+ Beneficiaries" on the public card.
    // Optional: albums seeded before this field existed just don't show it.
    beneficiaries: { type: Number, min: 0 },
    // Marks (at most, by convention — the UI just uses the first match) one
    // album for the large "Featured" treatment at the top of the Gallery
    // page's grid.
    featured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Album", albumSchema);
