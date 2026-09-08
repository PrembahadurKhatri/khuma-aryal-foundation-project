import express from "express";
import { body } from "express-validator";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/eventController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// "image" (the card/hero cover, one) and "images" (up to 6, the detail
// page's own photo gallery) uploaded together — same pattern as
// projectRoutes.js's images+thumbnail combo.
const eventUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

// eventController.js's fromFlatFields always rebuilds `name` from
// nameEn/nameNe unconditionally (unlike News/Notice's guarded version), on
// both create AND update — so nameEn/nameNe are required here on both
// routes too, not just create, otherwise an update that omits them would
// silently blank out a required field.
const nameValidators = [
  body("nameEn").trim().notEmpty().withMessage("English name is required"),
  body("nameNe").trim().notEmpty().withMessage("Nepali name is required"),
];
const descriptionValidators = [
  body("descriptionEn").optional({ checkFalsy: true }).trim(),
  body("descriptionNe").optional({ checkFalsy: true }).trim(),
];
const createValidators = [
  ...nameValidators,
  ...descriptionValidators,
  body("date").isISO8601().withMessage("A valid date is required"),
];
const updateValidators = [
  ...nameValidators,
  ...descriptionValidators,
  body("date").optional().isISO8601().withMessage("Invalid date"),
];

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", protect, authorize("admin", "editor"), eventUpload, createValidators, validate, createEvent);
router.put("/:id", protect, authorize("admin", "editor"), eventUpload, updateValidators, validate, updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

export default router;
