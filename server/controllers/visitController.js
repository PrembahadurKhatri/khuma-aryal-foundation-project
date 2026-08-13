import asyncHandler from "express-async-handler";
import Visit from "../models/Visit.js";

// @desc   Record one public-page view (fire-and-forget from the client)
// @route  POST /api/visits
export const recordVisit = asyncHandler(async (req, res) => {
  await Visit.create({ path: req.body.path || "/" });
  res.status(201).json({ success: true });
});

// @desc   Visit counts for the admin dashboard
// @route  GET /api/visits/stats
export const getVisitStats = asyncHandler(async (req, res) => {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, last7Days, last30Days] = await Promise.all([
    Visit.countDocuments(),
    Visit.countDocuments({ createdAt: { $gte: since7d } }),
    Visit.countDocuments({ createdAt: { $gte: since30d } }),
  ]);

  res.json({ success: true, data: { total, last7Days, last30Days } });
});
