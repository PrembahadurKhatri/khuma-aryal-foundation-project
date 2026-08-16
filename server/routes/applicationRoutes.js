import express from "express";
import { getApplications, updateApplicationStatus, deleteApplication } from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All admin-only — createApplication (the public submission) lives on
// vacancyRoutes.js as POST /api/vacancies/:id/apply instead, since it's
// conceptually "apply to this vacancy" rather than "create an application
// resource" from the public's point of view.
router.get("/", protect, authorize("admin", "editor"), getApplications);
router.put("/:id", protect, authorize("admin", "editor"), updateApplicationStatus);
router.delete("/:id", protect, authorize("admin"), deleteApplication);

export default router;
