import express from "express";
import { getVacancies, getVacancy, createVacancy, updateVacancy, deleteVacancy } from "../controllers/vacancyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getVacancies);
router.get("/:id", getVacancy);
router.post("/", protect, authorize("admin", "editor"), createVacancy);
router.put("/:id", protect, authorize("admin", "editor"), updateVacancy);
router.delete("/:id", protect, authorize("admin"), deleteVacancy);

export default router;
