import express from "express";
import { getDownloads, getDownload, createDownload, updateDownload, deleteDownload } from "../controllers/downloadController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getDownloads);
router.get("/:id", getDownload);
router.post("/", protect, authorize("admin", "editor"), upload.document("file"), createDownload);
router.put("/:id", protect, authorize("admin", "editor"), upload.document("file"), updateDownload);
router.delete("/:id", protect, authorize("admin"), deleteDownload);

export default router;
