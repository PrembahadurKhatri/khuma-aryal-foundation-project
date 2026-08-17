import asyncHandler from "express-async-handler";
import JobApplication from "../models/JobApplication.js";
import Vacancy from "../models/Vacancy.js";
import Settings from "../models/Settings.js";
import sendEmail from "../utils/sendEmail.js";
import wrapEmail from "../utils/emailTemplate.js";

// @desc   Submit a job application (VacancyDetail.jsx's fillup form)
// @route  POST /api/vacancies/:id/apply  (public)
export const createApplication = asyncHandler(async (req, res) => {
  const vacancy = await Vacancy.findById(req.params.id);
  if (!vacancy) {
    res.status(404);
    throw new Error("Vacancy not found");
  }

  const { applicantName, email, phone } = req.body;
  const coverLetterFile = req.files?.coverLetter?.[0];
  if (!applicantName || !email || !coverLetterFile) {
    res.status(400);
    throw new Error("Name, email and a cover letter file (PDF or image) are required");
  }

  const payload = {
    vacancy: vacancy._id,
    vacancyTitle: vacancy.title.en,
    applicantName,
    email,
    phone,
    coverLetter: coverLetterFile.path,
  };
  const resumeFile = req.files?.resume?.[0];
  if (resumeFile) payload.resume = resumeFile.path;

  const application = await JobApplication.create(payload);

  // Same fire-and-forget pattern as messageController.js's contact form —
  // the submission is already durable once created above, so a slow/down
  // email provider must not hold up the response.
  res.status(201).json({ success: true, message: "Thank you — your application has been submitted." });

  notifyNewApplication(application).catch((err) => console.error("Application notification email failed:", err.message));
});

const notifyNewApplication = async (application) => {
  const settings = await Settings.findOne();
  const to = settings?.email || process.env.EMAIL_FROM;
  if (!to) return;

  await sendEmail({
    to,
    subject: `New Job Application: ${application.vacancyTitle}`,
    html: wrapEmail({
      title: "New job application",
      preheader: `${application.applicantName} applied for ${application.vacancyTitle}`,
      bodyHtml: `
        <p><strong>Position:</strong> ${application.vacancyTitle}</p>
        <p><strong>Name:</strong> ${application.applicantName}</p>
        <p><strong>Email:</strong> <a href="mailto:${application.email}" style="color:#c9a65b;">${application.email}</a></p>
        ${application.phone ? `<p><strong>Phone:</strong> ${application.phone}</p>` : ""}
        ${application.resume ? `<p><strong>Resume:</strong> <a href="${application.resume}" style="color:#c9a65b;">View attachment</a></p>` : ""}
        <p><strong>Cover letter:</strong> <a href="${application.coverLetter}" style="color:#c9a65b;">View attachment</a></p>
      `,
    }),
  });
};

// @desc   List applications, newest first (?vacancy=<id> filters)
// @route  GET /api/applications  (admin)
export const getApplications = asyncHandler(async (req, res) => {
  const { vacancy, status } = req.query;
  const query = {};
  if (vacancy) query.vacancy = vacancy;
  if (status) query.status = status;

  const applications = await JobApplication.find(query).sort("-createdAt");
  res.json({ success: true, count: applications.length, data: applications });
});

const STATUS_VALUES = ["new", "reviewed", "shortlisted", "interview", "hired", "rejected"];

// Statuses that represent an actual decision the applicant should be told
// about — "new"/"reviewed" are internal bookkeeping only.
const STATUS_COPY = {
  shortlisted: {
    subject: (v) => `You've been shortlisted — ${v}`,
    heading: "You've been shortlisted",
    lead: (a) => `Good news, ${a.applicantName} — you've been shortlisted for the <strong>${a.vacancyTitle}</strong> position. We'll be in touch soon with next steps.`,
  },
  interview: {
    subject: (v) => `Interview invitation — ${v}`,
    heading: "Interview invitation",
    lead: (a) => `Congratulations, ${a.applicantName} — we'd like to invite you for an interview for the <strong>${a.vacancyTitle}</strong> position.`,
  },
  hired: {
    subject: (v) => `Congratulations — offer for ${v}`,
    heading: "Congratulations!",
    lead: (a) => `We're delighted to offer you the <strong>${a.vacancyTitle}</strong> position, ${a.applicantName}. Welcome to the team!`,
  },
  rejected: {
    subject: (v) => `Update on your application — ${v}`,
    heading: "Application update",
    lead: (a) =>
      `Thank you for applying for the <strong>${a.vacancyTitle}</strong> position, ${a.applicantName}. After careful review, we won't be moving forward with your application at this time. We appreciate your interest and encourage you to apply for future openings.`,
  },
};

// @desc   Update an application's status — shortlisted/interview/hired/
//         rejected also emails the applicant (optionally with a note, and
//         for "interview" the picked date/time). new/reviewed are silent
//         (internal only).
// @route  PUT /api/applications/:id  (admin)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note, interviewAt } = req.body;
  if (!STATUS_VALUES.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const update = { status };
  if (status === "interview" && interviewAt) update.interviewAt = new Date(interviewAt);

  const application = await JobApplication.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }
  res.json({ success: true, data: application });

  if (STATUS_COPY[status]) {
    notifyApplicantStatusChange(application, status, note).catch((err) => console.error("Applicant status email failed:", err.message));
  }
});

// Nepal Time, e.g. "Monday, 25 August 2026 at 10:00 AM (Nepal Time)".
const formatInterviewTime = (date) =>
  `${new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kathmandu",
  }).format(date)} (Nepal Time)`;

const notifyApplicantStatusChange = async (application, status, note) => {
  const copy = STATUS_COPY[status];
  const interviewBlock =
    status === "interview" && application.interviewAt
      ? `<table role="presentation" style="margin-top:16px;width:100%;background:#173b25;border-radius:8px;">
          <tr><td style="padding:14px 16px;">
            <span style="display:block;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#d3b46a;">Interview Scheduled</span>
            <span style="display:block;margin-top:4px;font-size:15px;font-weight:700;color:#ffffff;">${formatInterviewTime(application.interviewAt)}</span>
          </td></tr>
        </table>`
      : "";

  await sendEmail({
    to: application.email,
    subject: copy.subject(application.vacancyTitle),
    html: wrapEmail({
      title: copy.heading,
      preheader: copy.heading,
      bodyHtml: `
        <p>${copy.lead(application)}</p>
        ${interviewBlock}
        ${note ? `<p style="margin-top:16px;padding:14px 16px;background:#f8f7f2;border-left:3px solid #c9a65b;border-radius:4px;">${note}</p>` : ""}
        <p style="margin-top:20px;">Best regards,<br/>Khuma Aryal Foundation</p>
      `,
    }),
  });
};

// @desc   Delete an application
// @route  DELETE /api/applications/:id  (admin)
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await JobApplication.findByIdAndDelete(req.params.id);
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }
  res.json({ success: true, message: "Application deleted" });
});
