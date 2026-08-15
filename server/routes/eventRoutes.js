import express from "express";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", protect, authorize("admin", "editor"), upload.single("image"), createEvent);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("image"), updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

export default router;
