import express from "express";
import {
  getBoardMembers,
  getBoardMember,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember,
} from "../controllers/boardMemberController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getBoardMembers);
router.get("/:id", getBoardMember);
router.post("/", protect, authorize("admin", "editor"), upload.single("photo"), createBoardMember);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("photo"), updateBoardMember);
router.delete("/:id", protect, authorize("admin"), deleteBoardMember);

export default router;
