import express from "express";
import { body } from "express-validator";
import { getStories, getStory, createStory, updateStory, deleteStory } from "../controllers/storyController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// "photo" (the required card cover, one) and "images" (up to 6, the detail
// page's own photo gallery) uploaded together — same pattern as
// projectRoutes.js's images+thumbnail combo.
const storyUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

// storyController.js's fromFlatFields always rebuilds `summary` from
// summaryEn/summaryNe unconditionally on both create AND update, so both
// are required here on both routes too.
const summaryValidators = [
  body("summaryEn").trim().notEmpty().withMessage("English summary is required"),
  body("summaryNe").trim().notEmpty().withMessage("Nepali summary is required"),
  body("nameEn").optional({ checkFalsy: true }).trim(),
  body("nameNe").optional({ checkFalsy: true }).trim(),
  body("descriptionEn").optional({ checkFalsy: true }).trim(),
  body("descriptionNe").optional({ checkFalsy: true }).trim(),
];

router.get("/", getStories);
router.get("/:id", getStory);
router.post("/", protect, authorize("admin", "editor"), storyUpload, summaryValidators, validate, createStory);
router.put("/:id", protect, authorize("admin", "editor"), storyUpload, summaryValidators, validate, updateStory);
router.delete("/:id", protect, authorize("admin"), deleteStory);

export default router;
