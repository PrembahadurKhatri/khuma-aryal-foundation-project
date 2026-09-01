import express from "express";
import { body } from "express-validator";
import { getDownloads, getDownload, createDownload, updateDownload, deleteDownload } from "../controllers/downloadController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { DOWNLOAD_TYPES } from "../models/Download.js";

const router = express.Router();

// downloadController.js's fromFlatFields always rebuilds `title` from
// titleEn/titleNe unconditionally on both create AND update.
const titleValidators = [
  body("titleEn").trim().notEmpty().withMessage("English title is required"),
  body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
];
const typeValidator = body("type").optional({ checkFalsy: true }).isIn(DOWNLOAD_TYPES).withMessage("Invalid type");

router.get("/", getDownloads);
router.get("/:id", getDownload);
router.post("/", protect, authorize("admin", "editor"), upload.document("file"), [...titleValidators, typeValidator], validate, createDownload);
router.put("/:id", protect, authorize("admin", "editor"), upload.document("file"), [...titleValidators, typeValidator], validate, updateDownload);
router.delete("/:id", protect, authorize("admin"), deleteDownload);

export default router;
