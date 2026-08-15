import express from "express";
import { getStories, getStory, createStory, updateStory, deleteStory } from "../controllers/storyController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getStories);
router.get("/:id", getStory);
router.post("/", protect, authorize("admin", "editor"), upload.single("photo"), createStory);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("photo"), updateStory);
router.delete("/:id", protect, authorize("admin"), deleteStory);

export default router;
