import asyncHandler from "express-async-handler";
import Message from "../models/Message.js";

// @desc   Submit the public "Contact Us" form
// @route  POST /api/messages  (public)
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }
  await Message.create({ name, email, subject, message });
  res.status(201).json({ success: true, message: "Thank you, we will get back to you shortly." });
});

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
