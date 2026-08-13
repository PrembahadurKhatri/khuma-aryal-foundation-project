import mongoose from "mongoose";

// One document per public "Contact Us" form submission (About.jsx's
// send-message form). Feeds the "New Messages" stat on the admin dashboard.
const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
