import mongoose from "mongoose";

// One document per public job-application form submission (VacancyDetail.jsx),
// mirroring Message.js's "Contact Us" pattern — feeds an admin review screen
// rather than being sent anywhere on its own.
const applicationSchema = new mongoose.Schema(
  {
    vacancy: { type: mongoose.Schema.Types.ObjectId, ref: "Vacancy", required: true },
    // Denormalized alongside `vacancy` so the admin list/email still shows
    // which position this was for even if the vacancy is later deleted.
    vacancyTitle: { type: String, trim: true },
    applicantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    // Uploaded (PDF or a scanned/photographed image), not typed — a plain
    // URL, same as every other uploaded-asset field in this app.
    coverLetter: { type: String, required: true, trim: true },
    // Optional uploaded resume/CV — a plain URL too.
    resume: { type: String, trim: true, default: "" },
    // "new"/"reviewed" are internal-only stages; "shortlisted", "interview",
    // "hired" and "rejected" also trigger a status-update email to the
    // applicant (see applicationController.js's NOTIFIABLE_STATUSES).
    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "interview", "hired", "rejected"],
      default: "new",
    },
    // Set when status is moved to "interview" via the admin's date/time
    // picker — included in the notification email and shown back in the
    // admin panel so the scheduled time isn't just buried in an old email.
    interviewAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("JobApplication", applicationSchema);
