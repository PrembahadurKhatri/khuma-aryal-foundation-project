import express from "express";
import { body } from "express-validator";
import { createMessage, getMessages, updateMessageStatus, deleteMessage } from "../controllers/messageController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().isLength({ max: 200 }).withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Enter a valid email address"),
    body("subject").optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage("Subject is too long"),
    body("message").trim().notEmpty().isLength({ max: 5000 }).withMessage("Message is required (max 5000 characters)"),
  ],
  validate,
  createMessage
);
router.get("/", protect, authorize("admin", "editor"), getMessages);
router.put(
  "/:id",
  protect,
  authorize("admin", "editor"),
  // Message.findByIdAndUpdate() in the controller doesn't pass
  // runValidators, so the schema's own status enum never actually runs on
  // update — this was the only thing standing between an arbitrary string
  // and the database.
  [body("status").isIn(["new", "read"]).withMessage("Invalid status")],
  validate,
  updateMessageStatus
);
router.delete("/:id", protect, authorize("admin"), deleteMessage);

export default router;
