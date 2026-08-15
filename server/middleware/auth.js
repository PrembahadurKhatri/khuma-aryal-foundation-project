import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { jwtSecret } from "../utils/generateToken.js";
import { FALLBACK_ADMIN_ID, fallbackAdminUser } from "../utils/fallbackAdmin.js";

// Verify access token and attach user to req
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // The fallback admin isn't a Mongo document (see utils/fallbackAdmin.js) —
    // looking it up via findById would throw a CastError on the bad ObjectId.
    if (decoded.id === FALLBACK_ADMIN_ID) {
      req.user = fallbackAdminUser;
      return next();
    }

    // Excludes refreshTokens too, not just password — those tokens are only
    // ever meant to live in the httpOnly cookie, never in a JSON response
    // (e.g. GET /auth/me) where client-side JS (and therefore XSS) could
    // read them and bypass the whole point of httpOnly.
    req.user = await User.findById(decoded.id).select("-password -refreshTokens");
    if (!req.user) {
      res.status(401);
      throw new Error("User no longer exists");
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user?.role}' is not permitted to access this resource`);
    }
    next();
  };
};
