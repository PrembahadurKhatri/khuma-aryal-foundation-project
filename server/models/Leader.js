import mongoose from "mongoose";

// A person featured in the Home page's "Leadership & Messages" section —
// Founder, President, or supporting leadership (Past President, Advisor,
// Secretary, Spouse, ...). "founder" and "president" are the two special
// `role` values LeadershipMessages.jsx gives a large featured treatment;
// every other role renders in the quieter "Other Leadership" grid, sorted
// by `order`.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

const leaderSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true, default: "advisor" },
    name: { type: bilingual, required: true },
    title: { type: bilingual, required: true },
    message: { type: bilingual, required: true },
    photo: { type: String, required: true },
    // Display order within the "Other Leadership" grid (ascending). Ignored
    // for founder/president, which each always get their own featured slot.
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Leader", leaderSchema);
