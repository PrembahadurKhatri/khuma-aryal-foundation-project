import express from "express";
import { getNotices, getNotice, createNotice, updateNotice, deleteNotice } from "../controllers/noticeController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getNotices);
router.get("/:id", getNotice);
router.post("/", protect, authorize("admin", "editor"), upload.document("attachment"), createNotice);
router.put("/:id", protect, authorize("admin", "editor"), upload.document("attachment"), updateNotice);
router.delete("/:id", protect, authorize("admin"), deleteNotice);

export default router;
