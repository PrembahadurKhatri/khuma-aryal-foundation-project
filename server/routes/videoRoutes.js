import express from "express";
import { getVideos, getVideo, createVideo, updateVideo, deleteVideo } from "../controllers/videoController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();
const mediaFields = [{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }];

router.get("/", getVideos);
router.get("/:id", getVideo);
router.post("/", protect, authorize("admin", "editor"), upload.media(mediaFields), createVideo);
router.put("/:id", protect, authorize("admin", "editor"), upload.media(mediaFields), updateVideo);
router.delete("/:id", protect, authorize("admin"), deleteVideo);

export default router;
