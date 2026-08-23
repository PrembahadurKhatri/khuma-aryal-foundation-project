import express from "express";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// "image" (the card/hero cover, one) and "images" (up to 6, the detail
// page's own photo gallery) uploaded together — same pattern as
// projectRoutes.js's images+thumbnail combo.
const eventUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", protect, authorize("admin", "editor"), eventUpload, createEvent);
router.put("/:id", protect, authorize("admin", "editor"), eventUpload, updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

export default router;
