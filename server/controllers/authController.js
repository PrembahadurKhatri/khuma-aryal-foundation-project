import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, setAuthCookies, jwtRefreshSecret } from "../utils/generateToken.js";
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
  try {
    user = await User.findOne({ email }).select("+password");
  } catch (dbError) {
    console.warn("Falling back to local admin credentials because the database lookup failed:", dbError.message);
  }

  if (!user) {
    if (isFallbackAdminLogin(email, password)) {
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
