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
  } else if (req.cookies?.accessToken && (req.method === "GET" || req.method === "HEAD")) {
    // CSRF mitigation: the access token cookie is accepted on its own only
    // for read requests. State-changing requests (POST/PUT/PATCH/DELETE)
    // must carry the Authorization header instead. This matters because
    // the client/server run cross-origin (Vercel + Render), so cookies are
    // set SameSite=None — the browser attaches them to a request from
    // *any* site. JSON requests are naturally safe from this (a
    // cross-origin fetch with a JSON body triggers a CORS preflight, which
    // this API's origin allowlist rejects before the real request is ever
    // sent) — but multipart/form-data requests are exempt from CORS
    // preflighting, so without this check a malicious page could forge a
    // state-changing multipart request (e.g. create/edit content) that
    // rides on an already-logged-in admin's cookies alone. The
    // Authorization header can't be forged this way: the access token
    // lives only in this tab's JS memory (see client/src/services/api.js),
    // never in a cookie or localStorage a cross-origin page could read.
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
