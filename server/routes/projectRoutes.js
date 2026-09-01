import express from "express";
import { body } from "express-validator";
import { getProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { ALBUM_CATEGORIES } from "../models/Album.js";

const router = express.Router();

// "images" (up to 6, the gallery grid) and "thumbnail" (one, the hero/card
// cover photo) uploaded together — see middleware/upload.js's generic
// .fields() helper, same pattern as gallery videos' video+thumbnail combo.
const projectUpload = upload.fields([
  { name: "images", maxCount: 6 },
  { name: "thumbnail", maxCount: 1 },
]);

const createValidators = [
  body("titleEn").trim().notEmpty().withMessage("English title is required"),
  body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
  body("descriptionEn").trim().notEmpty().withMessage("English description is required"),
  body("descriptionNe").trim().notEmpty().withMessage("Nepali description is required"),
  body("status").optional({ checkFalsy: true }).isIn(["ongoing", "completed", "upcoming"]).withMessage("Invalid status"),
  body("category").optional({ checkFalsy: true }).isIn(ALBUM_CATEGORIES).withMessage("Invalid category"),
];
const updateValidators = [
  body("titleEn").optional().trim().notEmpty().withMessage("English title cannot be empty"),
  body("titleNe").optional().trim().notEmpty().withMessage("Nepali title cannot be empty"),
  body("descriptionEn").optional().trim().notEmpty().withMessage("English description cannot be empty"),
  body("descriptionNe").optional().trim().notEmpty().withMessage("Nepali description cannot be empty"),
  body("status").optional({ checkFalsy: true }).isIn(["ongoing", "completed", "upcoming"]).withMessage("Invalid status"),
  body("category").optional({ checkFalsy: true }).isIn(ALBUM_CATEGORIES).withMessage("Invalid category"),
];

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", protect, authorize("admin", "editor"), projectUpload, createValidators, validate, createProject);
router.put("/:id", protect, authorize("admin", "editor"), projectUpload, updateValidators, validate, updateProject);
router.delete("/:id", protect, authorize("admin"), deleteProject);

export default router;
