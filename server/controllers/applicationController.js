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

// @desc   Mark an application new/reviewed
// @route  PUT /api/applications/:id  (admin)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await JobApplication.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }
  res.json({ success: true, data: application });
});

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
