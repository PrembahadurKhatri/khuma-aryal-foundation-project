import express from "express";
import { body } from "express-validator";
import { getNotices, getNotice, createNotice, updateNotice, deleteNotice } from "../controllers/noticeController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { NOTICE_PRIORITIES } from "../models/Notice.js";

const router = express.Router();

// "attachment" (PDF/doc, one) and "images" (up to 6, the detail page's own
// photo gallery) uploaded together — needs the mixed document+image
// `upload.notice` instance (see middleware/upload.js) since these two
// fields are different file types.
const noticeUpload = upload.notice([
  { name: "attachment", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

const createValidators = [
  body("titleEn").trim().notEmpty().withMessage("English title is required"),
  body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
  body("priority").optional({ checkFalsy: true }).isIn(NOTICE_PRIORITIES).withMessage("Invalid priority"),
  body("date").optional({ checkFalsy: true }).isISO8601().withMessage("Invalid date"),
];
const updateValidators = [
  body("titleEn").optional().trim().notEmpty().withMessage("English title cannot be empty"),
  body("titleNe").optional().trim().notEmpty().withMessage("Nepali title cannot be empty"),
  body("priority").optional({ checkFalsy: true }).isIn(NOTICE_PRIORITIES).withMessage("Invalid priority"),
  body("date").optional({ checkFalsy: true }).isISO8601().withMessage("Invalid date"),
];

router.get("/", getNotices);
router.get("/:id", getNotice);
router.post("/", protect, authorize("admin", "editor"), noticeUpload, createValidators, validate, createNotice);
router.put("/:id", protect, authorize("admin", "editor"), noticeUpload, updateValidators, validate, updateNotice);
router.delete("/:id", protect, authorize("admin"), deleteNotice);

export default router;
