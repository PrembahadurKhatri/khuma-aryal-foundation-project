import express from "express";
import { getNews, getNewsItem, createNews, updateNews, deleteNews } from "../controllers/newsController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// "image" (the card/hero cover, one) and "images" (up to 6, the detail
// page's own photo gallery) uploaded together — same pattern as
// projectRoutes.js's images+thumbnail combo.
const newsUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

router.get("/", getNews);
router.get("/:id", getNewsItem);
router.post("/", protect, authorize("admin", "editor"), newsUpload, createNews);
router.put("/:id", protect, authorize("admin", "editor"), newsUpload, updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);

export default router;
