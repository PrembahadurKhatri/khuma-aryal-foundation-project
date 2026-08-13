import express from "express";
import { recordVisit, getVisitStats } from "../controllers/visitController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", recordVisit);
router.get("/stats", protect, authorize("admin", "editor"), getVisitStats);

export default router;
