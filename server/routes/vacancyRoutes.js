import express from "express";
import { getVacancies, getVacancy, createVacancy, updateVacancy, deleteVacancy } from "../controllers/vacancyController.js";
import { createApplication } from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getVacancies);
router.get("/:id", getVacancy);
router.post("/", protect, authorize("admin", "editor"), createVacancy);
router.put("/:id", protect, authorize("admin", "editor"), updateVacancy);
router.delete("/:id", protect, authorize("admin"), deleteVacancy);
// Public — VacancyDetail.jsx's fillup form. "coverLetter" (PDF or image) is
// required, "resume" (PDF/Word) is optional.
router.post(
  "/:id/apply",
  upload.application([
    { name: "coverLetter", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  createApplication
);

export default router;
