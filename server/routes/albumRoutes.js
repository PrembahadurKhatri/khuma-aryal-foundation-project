import express from "express";
import { body } from "express-validator";
import { getAlbums, getAlbum, createAlbum, updateAlbum, deleteAlbum } from "../controllers/albumController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { ALBUM_CATEGORIES } from "../models/Album.js";

const router = express.Router();

const albumUpload = upload.fields([
  { name: "cover", maxCount: 1 },
  { name: "photos", maxCount: 100 },
]);

// albumController.js's fromFlatFields always rebuilds `title` from
// titleEn/titleNe unconditionally on both create AND update, so both are
// required here on both routes too.
const titleValidators = [
  body("titleEn").trim().notEmpty().withMessage("English title is required"),
  body("titleNe").trim().notEmpty().withMessage("Nepali title is required"),
];
const categoryValidator = body("category").optional({ checkFalsy: true }).isIn(ALBUM_CATEGORIES).withMessage("Invalid category");

router.get("/", getAlbums);
router.get("/:id", getAlbum);
router.post("/", protect, authorize("admin", "editor"), albumUpload, [...titleValidators, categoryValidator], validate, createAlbum);
router.put("/:id", protect, authorize("admin", "editor"), albumUpload, [...titleValidators, categoryValidator], validate, updateAlbum);
router.delete("/:id", protect, authorize("admin"), deleteAlbum);

export default router;
