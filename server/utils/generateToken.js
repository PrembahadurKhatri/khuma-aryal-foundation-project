import jwt from "jsonwebtoken";

export const jwtSecret = process.env.JWT_SECRET || "local-dev-secret";
export const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "local-dev-refresh-secret";

export const generateAccessToken = (id) =>
  jwt.sign({ id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRE || "15m" });

export const generateRefreshToken = (id) =>
  jwt.sign({ id }, jwtRefreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
