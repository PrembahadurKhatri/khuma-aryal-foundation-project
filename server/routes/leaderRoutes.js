import express from "express";
import { body } from "express-validator";
import { getLeaders, getLeader, createLeader, updateLeader, deleteLeader } from "../controllers/leaderController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";

const router = express.Router();

const createValidators = [
  body("nameEn").trim().notEmpty().withMessage("English name is required"),
  body("nameNe").trim().notEmpty().withMessage("Nepali name is required"),
  body("titleEn").trim().notEmpty().withMessage("English title is required"),
  body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
  body("messageEn").trim().notEmpty().withMessage("English message is required"),
  body("messageNe").trim().notEmpty().withMessage("Nepali message is required"),
];
const updateValidators = [
  body("nameEn").optional().trim().notEmpty().withMessage("English name cannot be empty"),
  body("nameNe").optional().trim().notEmpty().withMessage("Nepali name cannot be empty"),
  body("titleEn").optional().trim().notEmpty().withMessage("English title cannot be empty"),
  body("titleNe").optional().trim().notEmpty().withMessage("Nepali title cannot be empty"),
  body("messageEn").optional().trim().notEmpty().withMessage("English message cannot be empty"),
  body("messageNe").optional().trim().notEmpty().withMessage("Nepali message cannot be empty"),
];

router.get("/", getLeaders);
router.get("/:id", getLeader);
router.post("/", protect, authorize("admin", "editor"), upload.single("photo"), createValidators, validate, createLeader);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("photo"), updateValidators, validate, updateLeader);
router.delete("/:id", protect, authorize("admin"), deleteLeader);

export default router;
