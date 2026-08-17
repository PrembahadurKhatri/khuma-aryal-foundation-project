import express from "express";
import { getLeaders, getLeader, createLeader, updateLeader, deleteLeader } from "../controllers/leaderController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getLeaders);
router.get("/:id", getLeader);
router.post("/", protect, authorize("admin", "editor"), upload.single("photo"), createLeader);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("photo"), updateLeader);
router.delete("/:id", protect, authorize("admin"), deleteLeader);

export default router;
