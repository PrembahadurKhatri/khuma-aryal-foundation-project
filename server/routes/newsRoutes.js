import express from "express";
import { getNews, getNewsItem, createNews, updateNews, deleteNews } from "../controllers/newsController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getNews);
router.get("/:id", getNewsItem);
router.post("/", protect, authorize("admin", "editor"), upload.single("image"), createNews);
router.put("/:id", protect, authorize("admin", "editor"), upload.single("image"), updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);

export default router;
