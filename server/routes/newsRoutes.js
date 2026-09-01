import express from "express";
import { body } from "express-validator";
import { getNews, getNewsItem, createNews, updateNews, deleteNews } from "../controllers/newsController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { NEWS_CATEGORIES } from "../models/News.js";

const router = express.Router();

// "image" (the card/hero cover, one) and "images" (up to 6, the detail
// page's own photo gallery) uploaded together — same pattern as
// projectRoutes.js's images+thumbnail combo.
const newsUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

// Validation runs AFTER newsUpload — multer is what populates req.body for
// a multipart/form-data request, so a validator placed before it would see
// an empty body. required() on create, optional() on update — matches
// fromFlatFields' partial-update semantics (a PUT that only sends
// `category` shouldn't fail because title wasn't resent).
const createValidators = [
  body("titleEn").trim().notEmpty().withMessage("English title is required"),
  body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
  body("descriptionEn").trim().notEmpty().withMessage("English description is required"),
  body("descriptionNe").trim().notEmpty().withMessage("Nepali description is required"),
  body("category").optional({ checkFalsy: true }).isIn(NEWS_CATEGORIES).withMessage("Invalid category"),
  body("date").optional({ checkFalsy: true }).isISO8601().withMessage("Invalid date"),
];
const updateValidators = [
  body("titleEn").optional().trim().notEmpty().withMessage("English title cannot be empty"),
  body("titleNe").optional().trim().notEmpty().withMessage("Nepali title cannot be empty"),
  body("descriptionEn").optional().trim().notEmpty().withMessage("English description cannot be empty"),
  body("descriptionNe").optional().trim().notEmpty().withMessage("Nepali description cannot be empty"),
  body("category").optional({ checkFalsy: true }).isIn(NEWS_CATEGORIES).withMessage("Invalid category"),
  body("date").optional({ checkFalsy: true }).isISO8601().withMessage("Invalid date"),
];

router.get("/", getNews);
router.get("/:id", getNewsItem);
router.post("/", protect, authorize("admin", "editor"), newsUpload, createValidators, validate, createNews);
router.put("/:id", protect, authorize("admin", "editor"), newsUpload, updateValidators, validate, updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);

export default router;
