import express from "express";
import { getNotices, getNotice, createNotice, updateNotice, deleteNotice } from "../controllers/noticeController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// "attachment" (PDF/doc, one) and "images" (up to 6, the detail page's own
// photo gallery) uploaded together — needs the mixed document+image
// `upload.notice` instance (see middleware/upload.js) since these two
// fields are different file types.
const noticeUpload = upload.notice([
  { name: "attachment", maxCount: 1 },
  { name: "images", maxCount: 6 },
]);

router.get("/", getNotices);
router.get("/:id", getNotice);
router.post("/", protect, authorize("admin", "editor"), noticeUpload, createNotice);
router.put("/:id", protect, authorize("admin", "editor"), noticeUpload, updateNotice);
router.delete("/:id", protect, authorize("admin"), deleteNotice);

export default router;
