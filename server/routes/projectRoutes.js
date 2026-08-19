import express from "express";
import { getProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// "images" (up to 6, the gallery grid) and "thumbnail" (one, the hero/card
// cover photo) uploaded together — see middleware/upload.js's generic
// .fields() helper, same pattern as gallery videos' video+thumbnail combo.
const projectUpload = upload.fields([
  { name: "images", maxCount: 6 },
  { name: "thumbnail", maxCount: 1 },
]);

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", protect, authorize("admin", "editor"), projectUpload, createProject);
router.put("/:id", protect, authorize("admin", "editor"), projectUpload, updateProject);
router.delete("/:id", protect, authorize("admin"), deleteProject);

export default router;
