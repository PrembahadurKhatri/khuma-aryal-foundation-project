import asyncHandler from "express-async-handler";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, setAuthCookies, jwtRefreshSecret } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import wrapEmail from "../utils/emailTemplate.js";
import { FALLBACK_ADMIN_ID, isFallbackAdminLogin, fallbackAdminUser, fallbackAdminCredentials, isFallbackAdminId } from "../utils/fallbackAdmin.js";

// @desc   Register a new admin/editor user (admin-only)
// @route  POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const user = await User.create({ name, email, password, role: role || "editor" });

  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc   Login and receive access + refresh tokens
// @route  POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = null;
  let dbReachable = true;
  try {
    user = await User.findOne({ email }).select("+password");
  } catch (dbError) {
    dbReachable = false;
    console.warn("Falling back to local admin credentials because the database lookup failed:", dbError.message);
  }

  if (!user) {
    // The hardcoded/env fallback exists solely to bootstrap access before
    // any real admin account exists. Gating it on "the DB is reachable and
    // no real admin exists yet" (rather than just "no user matches THIS
    // email") matters once changeEmail/changePassword are in the picture:
    // changing an admin's email removes the OLD email from Mongo entirely,
    // and without this check that would silently reopen the fallback
    // credentials for the old email forever, even though the account
    // itself moved on — the opposite of what changing the email is for.
    // If the DB itself is unreachable, the fallback still applies
    // unconditionally (that's its actual bootstrap/resilience purpose).
    const fallbackAllowed = !dbReachable || !(await User.exists({ role: "admin" }));

    if (fallbackAllowed && isFallbackAdminLogin(email, password)) {
      const accessToken = generateAccessToken(fallbackAdminUser._id);
      const refreshToken = generateRefreshToken(fallbackAdminUser._id);
      setAuthCookies(res, accessToken, refreshToken);
      return res.json({
        success: true,
        data: {
          id: fallbackAdminUser._id,
          name: fallbackAdminUser.name,
          email: fallbackAdminUser.email,
          role: fallbackAdminUser.role,
        },
        accessToken,
      });
    }

    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Deliberately no fallback-credential check here — once a real User
  // document exists for this email, that document's password is
  // authoritative (see the mirrored comment in khilung-project for why).
  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push(refreshToken);
  user.lastLogin = new Date();
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

// @desc   Rotate refresh token for a new access token
// @route  POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtRefreshSecret);
  } catch {
    res.status(401);
    throw new Error("Refresh token invalid or expired");
  }

  if (decoded.id === FALLBACK_ADMIN_ID) {
    const newAccessToken = generateAccessToken(FALLBACK_ADMIN_ID);
    const newRefreshToken = generateRefreshToken(FALLBACK_ADMIN_ID);
    setAuthCookies(res, newAccessToken, newRefreshToken);
    return res.json({ success: true, accessToken: newAccessToken });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(token)) {
    res.status(401);
    throw new Error("Refresh token not recognized");
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  setAuthCookies(res, newAccessToken, newRefreshToken);
  res.json({ success: true, accessToken: newAccessToken });
});

// @desc   Logout: invalidate refresh token
// @route  POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id && decoded.id !== FALLBACK_ADMIN_ID) {
      await User.findByIdAndUpdate(decoded.id, { $pull: { refreshTokens: token } });
    }
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});

// @desc   Get current authenticated user
// @route  GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc   Change the logged-in user's own password (verifies current password first)
// @route  PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }
  if (newPassword.length < 8) {
    res.status(400);
    throw new Error("New password must be at least 8 characters");
  }

  // The fallback admin isn't a real Mongo document. Changing its password
  // provisions a real User account with the new password so the fallback
  // stops being the active credential from here on.
  if (isFallbackAdminId(req.user._id)) {
    if (!isFallbackAdminLogin(fallbackAdminCredentials.email, currentPassword)) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    const existing = await User.findOne({ email: fallbackAdminCredentials.email });
    if (existing) {
      existing.password = newPassword;
      existing.refreshTokens = [];
      await existing.save();
    } else {
      await User.create({
        name: fallbackAdminUser.name,
        email: fallbackAdminCredentials.email,
        password: newPassword,
        role: "admin",
      });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({ success: true, message: "Password changed. Please log in again with your new password." });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Password changed. Please log in again with your new password." });
});

// @desc   Change the logged-in user's own login email (verifies current
//         password first) — separate from Settings.email (the public
//         contact address shown on the site and used as the forgot-password
//         delivery address below); this is the address used to sign in.
// @route  PUT /api/auth/change-email
export const changeEmail = asyncHandler(async (req, res) => {
  const { currentPassword, newEmail } = req.body;
  if (!currentPassword || !newEmail) {
    res.status(400);
    throw new Error("Current password and new email are required");
  }

  const normalizedEmail = newEmail.trim().toLowerCase();

  // Same fallback-admin handling as changePassword above: the fallback
  // admin isn't a real Mongo document, so changing anything about it
  // provisions (or updates) a real User account from here on.
  if (isFallbackAdminId(req.user._id)) {
    if (!isFallbackAdminLogin(fallbackAdminCredentials.email, currentPassword)) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    const emailTaken = await User.findOne({ email: normalizedEmail });
    if (emailTaken) {
      res.status(400);
      throw new Error("That email is already in use");
    }

    const existing = await User.findOne({ email: fallbackAdminCredentials.email });
    if (existing) {
      existing.email = normalizedEmail;
      existing.refreshTokens = [];
      await existing.save();
    } else {
      await User.create({
        name: fallbackAdminUser.name,
        email: normalizedEmail,
        password: currentPassword,
        role: "admin",
      });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({ success: true, message: "Email changed. Please log in again with your new email." });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  if (normalizedEmail !== user.email) {
    const emailTaken = await User.findOne({ email: normalizedEmail });
    if (emailTaken) {
      res.status(400);
      throw new Error("That email is already in use");
    }
  }

  user.email = normalizedEmail;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Email changed. Please log in again with your new email." });
});

// @desc   Request password reset email. Delivered to the account's own
//         login `email` — NOT Settings.email (the public contact address
//         shown on the site, which anyone visiting it can see). Now that
//         changeEmail exists, the login email is the address the admin
//         actually controls and verifies by using it to sign in; routing
//         resets to a publicly-visible address instead would mean anyone
//         who could read that public inbox could reset any admin's
//         password regardless of what email they actually log in with —
//         the opposite of secure.
// @route  POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Do not reveal whether the email exists
    return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();

  const resetUrl = `${(process.env.CLIENT_URL || "").split(",")[0]?.trim()}/admin/reset-password/${resetToken}`;

  // Awaited (not fire-and-forget): a match WAS found (so there's no "does
  // this email exist" info to leak by the timing/outcome of the response),
  // and an admin waiting on a password reset needs to know immediately if
  // delivery genuinely failed (e.g. a missing/invalid RESEND_API_KEY)
  // instead of being told "sent" and then never receiving anything with no
  // way to tell why.
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset - Khuma Aryal Foundation Admin",
      html: wrapEmail({
        title: "Reset your password",
        preheader: "This link expires in 15 minutes.",
        bodyHtml: `
          <p>Hi ${user.name},</p>
          <p>We received a request to reset the password on your admin account. Click the button below to choose a new one — this link expires in <strong>15 minutes</strong>.</p>
          <p style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}" style="background:#2f7d45;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.03em;display:inline-block;">Reset Password</a>
          </p>
          <p style="color:#5f6862;font-size:12px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        `,
      }),
    });
  } catch (err) {
    console.error("Password reset email failed:", err.message);
    res.status(500);
    throw new Error(`Reset link generated but the email failed to send: ${err.message}`);
  }

  res.json({ success: true, message: "If that email exists, a reset link has been sent." });
});

// @desc   Reset password using token
// @route  POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Reset token is invalid or has expired");
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();

  res.json({ success: true, message: "Password reset successfully" });
});
