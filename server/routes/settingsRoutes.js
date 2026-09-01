import express from "express";
import { body } from "express-validator";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.get("/", getSettings);
router.put(
  "/",
  protect,
  authorize("admin", "editor"),
  [
    body("email").optional({ checkFalsy: true }).trim().isEmail().withMessage("Enter a valid contact email"),
    body("facebook").optional({ checkFalsy: true }).trim().isURL().withMessage("Facebook must be a valid URL"),
    body("instagram").optional({ checkFalsy: true }).trim().isURL().withMessage("Instagram must be a valid URL"),
    body("youtube").optional({ checkFalsy: true }).trim().isURL().withMessage("YouTube must be a valid URL"),
    body("metaTitle").optional({ checkFalsy: true }).trim().isLength({ max: 70 }).withMessage("Meta title should be under 70 characters"),
    body("metaDescription").optional({ checkFalsy: true }).trim().isLength({ max: 200 }).withMessage("Meta description should be under 200 characters"),
  ],
  validate,
  updateSettings
);

export default router;
