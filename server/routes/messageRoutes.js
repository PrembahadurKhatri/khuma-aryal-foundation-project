import express from "express";
import { body } from "express-validator";
import { createMessage, getMessages, updateMessageStatus, deleteMessage } from "../controllers/messageController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/",
  [body("name").notEmpty(), body("email").isEmail(), body("message").notEmpty()],
  validate,
  createMessage
);
router.get("/", protect, authorize("admin", "editor"), getMessages);
router.put("/:id", protect, authorize("admin", "editor"), updateMessageStatus);
router.delete("/:id", protect, authorize("admin"), deleteMessage);

export default router;
