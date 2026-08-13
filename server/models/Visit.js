import mongoose from "mongoose";

// One document per public-page load (see client/src/hooks/useTrackVisit.js).
// Deliberately minimal — powers the "Website Visitors" stat on the admin
// dashboard only, not full analytics.
const visitSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Visit", visitSchema);
