import express from "express";
import { body, param } from "express-validator";
import { getVacancies, getVacancy, createVacancy, updateVacancy, deleteVacancy } from "../controllers/vacancyController.js";
import { createApplication } from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.get("/", getVacancies);
router.get("/:id", getVacancy);
router.post(
  "/",
  protect,
  authorize("admin", "editor"),
  [
    body("titleEn").trim().notEmpty().withMessage("English title is required"),
    body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
    body("descriptionEn").trim().notEmpty().withMessage("English description is required"),
    body("descriptionNe").trim().notEmpty().withMessage("Nepali description is required"),
    body("deadline").isISO8601().withMessage("A valid deadline date is required"),
    body("applyLink").optional({ checkFalsy: true }).trim().isURL().withMessage("Apply link must be a valid URL"),
  ],
  validate,
  createVacancy
);
router.put(
  "/:id",
  protect,
  authorize("admin", "editor"),
  [
    body("titleEn").optional().trim().notEmpty().withMessage("English title cannot be empty"),
    body("titleNe").optional().trim().notEmpty().withMessage("Nepali title cannot be empty"),
    body("descriptionEn").optional().trim().notEmpty().withMessage("English description cannot be empty"),
    body("descriptionNe").optional().trim().notEmpty().withMessage("Nepali description cannot be empty"),
    body("deadline").optional().isISO8601().withMessage("A valid deadline date is required"),
    body("applyLink").optional({ checkFalsy: true }).trim().isURL().withMessage("Apply link must be a valid URL"),
  ],
  validate,
  updateVacancy
);
router.delete("/:id", protect, authorize("admin"), deleteVacancy);
// Public — VacancyDetail.jsx's fillup form. "coverLetter" (PDF or image) is
// required, "resume" (PDF/Word) is optional. Validation runs AFTER the
// multer upload middleware — multer is what actually populates req.body
// for a multipart/form-data request, so a validator placed before it would
// see an empty body regardless of what was actually submitted.
router.post(
  "/:id/apply",
  upload.application([
    { name: "coverLetter", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  [
    param("id").isMongoId().withMessage("Invalid vacancy id"),
    body("applicantName").trim().notEmpty().isLength({ max: 200 }).withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Enter a valid email address"),
    body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage("Phone number is too long"),
  ],
  validate,
  createApplication
);

export default router;
