import express from "express";
import { getGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } from "../controllers/galleryController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getGalleryImages);
router.post("/", protect, authorize("admin", "editor"), upload.single("image"), createGalleryImage);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("image"), updateGalleryImage);
router.delete("/:id", protect, authorize("admin"), deleteGalleryImage);

export default router;
