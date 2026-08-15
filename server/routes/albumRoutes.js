import express from "express";
import { getAlbums, getAlbum, createAlbum, updateAlbum, deleteAlbum } from "../controllers/albumController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

const albumUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "photos", maxCount: 100 },
]);

router.get("/", getAlbums);
router.get("/:id", getAlbum);
router.post("/", protect, authorize("admin", "editor"), albumUpload, createAlbum);
router.put("/:id", protect, authorize("admin", "editor"), albumUpload, updateAlbum);
router.delete("/:id", protect, authorize("admin"), deleteAlbum);

export default router;
