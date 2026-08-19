import mongoose from "mongoose";

// A member of the Foundation's governing Board — shown as a simple photo
// directory grid on the Home page ("Board Members" section), separate from
// the Founder/President/supporting-leadership "Messages" section (see
// models/Leader.js). Deliberately has no `message`/quote field — this is a
// plain roster (name + designation + photo), not a leadership-voices feature.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

const boardMemberSchema = new mongoose.Schema(
  {
    name: { type: bilingual, required: true },
    designation: { type: bilingual, required: true },
    photo: { type: String, required: true },
    // Display order within the Board Members grid (ascending).
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("BoardMember", boardMemberSchema);
