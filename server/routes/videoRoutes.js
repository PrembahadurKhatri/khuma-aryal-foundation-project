import express from "express";
import { body } from "express-validator";
import { getVideos, getVideo, createVideo, updateVideo, deleteVideo } from "../controllers/videoController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { ALBUM_CATEGORIES } from "../models/Album.js";

const router = express.Router();
const mediaFields = [{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }];

const categoryValidator = body("category").optional({ checkFalsy: true }).isIn(ALBUM_CATEGORIES).withMessage("Invalid category");
// embedUrl vs. an uploaded video file is an either/or handled in the
// controller itself (a plain required() would fight with whichever one is
// legitimately absent) — this only checks the format IF embedUrl was sent.
const embedUrlValidator = body("embedUrl").optional({ checkFalsy: true }).trim().isURL().withMessage("Embed URL must be a valid URL");
const createValidators = [
  body("titleEn").trim().notEmpty().withMessage("English title is required"),
  body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
  categoryValidator,
  embedUrlValidator,
];
const updateValidators = [
  body("titleEn").optional().trim().notEmpty().withMessage("English title cannot be empty"),
  body("titleNe").optional().trim().notEmpty().withMessage("Nepali title cannot be empty"),
  categoryValidator,
  embedUrlValidator,
];

router.get("/", getVideos);
router.get("/:id", getVideo);
router.post("/", protect, authorize("admin", "editor"), upload.media(mediaFields), createValidators, validate, createVideo);
router.put("/:id", protect, authorize("admin", "editor"), upload.media(mediaFields), updateValidators, validate, updateVideo);
router.delete("/:id", protect, authorize("admin"), deleteVideo);

export default router;
