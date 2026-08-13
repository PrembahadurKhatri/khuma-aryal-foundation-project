import express from "express";
import { getProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", protect, authorize("admin", "editor"), upload.array("images", 6), createProject);
router.put("/:id", protect, authorize("admin", "editor"), upload.array("images", 6), updateProject);
router.delete("/:id", protect, authorize("admin"), deleteProject);

export default router;
