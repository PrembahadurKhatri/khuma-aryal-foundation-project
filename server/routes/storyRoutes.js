import express from "express";
import { getStories, getStory, createStory, updateStory, deleteStory } from "../controllers/storyController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// "photo" (the required card cover, one) and "images" (up to 6, the detail
// page's own photo gallery) uploaded together — same pattern as
// projectRoutes.js's images+thumbnail combo.
const storyUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

router.get("/", getStories);
router.get("/:id", getStory);
router.post("/", protect, authorize("admin", "editor"), storyUpload, createStory);
router.put("/:id", protect, authorize("admin", "editor"), storyUpload, updateStory);
router.delete("/:id", protect, authorize("admin"), deleteStory);

export default router;
