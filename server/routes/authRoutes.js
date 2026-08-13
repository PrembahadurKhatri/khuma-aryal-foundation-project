import express from "express";
import { body } from "express-validator";
import { register, login, refresh, logout, getMe, changePassword } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/register",
  protect,
  authorize("admin"), // only an existing admin can create new admin/editor accounts
  [body("name").notEmpty(), body("email").isEmail(), body("password").isLength({ min: 8 })],
  validate,
  register
);

router.post("/login", [body("email").isEmail(), body("password").notEmpty()], validate, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put(
  "/change-password",
  protect,
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })],
  validate,
  changePassword
);

export default router;
