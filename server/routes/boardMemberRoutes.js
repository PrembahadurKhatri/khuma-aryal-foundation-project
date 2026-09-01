import express from "express";
import { body } from "express-validator";
import {
  getBoardMembers,
  getBoardMember,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
} from "../controllers/boardMemberController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";

const router = express.Router();

const createValidators = [
  body("nameEn").trim().notEmpty().withMessage("English name is required"),
  body("nameNe").trim().notEmpty().withMessage("Nepali name is required"),
  body("designationEn").trim().notEmpty().withMessage("English designation is required"),
  body("designationNe").trim().notEmpty().withMessage("Nepali designation is required"),
];
const updateValidators = [
  body("nameEn").optional().trim().notEmpty().withMessage("English name cannot be empty"),
  body("nameNe").optional().trim().notEmpty().withMessage("Nepali name cannot be empty"),
  body("designationEn").optional().trim().notEmpty().withMessage("English designation cannot be empty"),
  body("designationNe").optional().trim().notEmpty().withMessage("Nepali designation cannot be empty"),
];

router.get("/", getBoardMembers);
router.get("/:id", getBoardMember);
router.post("/", protect, authorize("admin", "editor"), upload.single("photo"), createValidators, validate, createBoardMember);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("photo"), updateValidators, validate, updateBoardMember);
router.delete("/:id", protect, authorize("admin"), deleteBoardMember);

export default router;
