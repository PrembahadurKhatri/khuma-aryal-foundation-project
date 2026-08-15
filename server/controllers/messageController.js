import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";
import Settings from "../models/Settings.js";
import sendEmail from "../utils/sendEmail.js";
import wrapEmail from "../utils/emailTemplate.js";

// @desc   Submit the public "Contact Us" form
// @route  POST /api/messages  (public)
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }
  const doc = await Message.create({ name, email, subject, message });

  // Respond immediately — the submission itself is already durable once the
  // DB write above completes. Notifying the office by email is best-effort
  // and must NOT block the response: a slow/unreachable email provider
  // would otherwise hang the client's "Sending..." state, even though the
  // message was saved in the first second. Fire-and-forget it instead.
  res.status(201).json({ success: true, message: "Thank you, we will get back to you shortly." });

  notifyNewMessage(doc).catch((err) => console.error("Contact notification email failed:", err.message));
});

// The office's own contact address (editable via admin Settings) is where
// new-message notifications go — falls back to EMAIL_FROM if Settings has
// no email set yet.
const notifyNewMessage = async (msg) => {
  const settings = await Settings.findOne();
  const to = settings?.email || process.env.EMAIL_FROM;
  if (!to) return; // nowhere to send it — skip rather than throw

  await sendEmail({
    to,
    subject: `New Contact Message from ${msg.name}`,
    html: wrapEmail({
      title: "New contact message",
      preheader: `${msg.name} sent a message via the website`,
      bodyHtml: `
        <p><strong>Name:</strong> ${msg.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${msg.email}" style="color:#c9a65b;">${msg.email}</a></p>
        ${msg.subject ? `<p><strong>Subject:</strong> ${msg.subject}</p>` : ""}
        <p style="margin-top:16px;padding:14px;background:#f7f5ef;border-radius:6px;"><strong>Message:</strong><br />${msg.message}</p>
      `,
    }),
  });
};

// @desc   List messages, newest first (?status=new|read)
// @route  GET /api/messages  (admin)
export const getMessages = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const messages = await Message.find(query).sort("-createdAt");
  res.json({ success: true, count: messages.length, data: messages });
});

// @desc   Mark a message read/unread
// @route  PUT /api/messages/:id
export const updateMessageStatus = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  res.json({ success: true, data: message });
});

// @desc   Delete a message
// @route  DELETE /api/messages/:id
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  res.json({ success: true, message: "Message deleted" });
});
