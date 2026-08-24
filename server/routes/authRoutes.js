import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  changeEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// A bare length check lets through things like "aaaaaaaa" — requiring at
// least one letter and one number is a cheap, low-friction step up in
// actual strength for every place a password gets set (register, change,
// reset), without demanding a full symbol/case policy that mostly just
// annoys people into writing it on a sticky note.
const strongPassword = (field) =>
  body(field)
    .isLength({ min: 8 })
    .withMessage(`${field === "password" ? "Password" : "New password"} must be at least 8 characters`)
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage(`${field === "password" ? "Password" : "New password"} must include at least one letter and one number`);

// Every email field is trimmed BEFORE isEmail() checks it — a stray
// leading/trailing space (an easy copy-paste artifact) otherwise fails
// isEmail() outright, and express-validator's own default message for that
// ("Invalid value") gives no hint why. .trim() is a sanitizer, not just a
// check — it mutates req.body in place, so the controller sees the
// trimmed value too. Every validator also gets a real .withMessage() so a
// failure surfaces something actionable in the response body instead of
// the generic default.
router.post(
  "/register",
  protect,
  authorize("admin"), // only an existing admin can create new admin/editor accounts
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Enter a valid email address"),
    strongPassword("password"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    strongPassword("newPassword"),
  ],
  validate,
  changePassword
);
router.put(
  "/change-email",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newEmail").trim().isEmail().withMessage("Enter a valid email address"),
  ],
  validate,
  changeEmail
);
router.post(
  "/forgot-password",
  [body("email").trim().isEmail().withMessage("Enter a valid email address")],
  validate,
  forgotPassword
);
router.post(
  "/reset-password/:token",
  [strongPassword("password")],
  validate,
  resetPassword
);

export default router;
