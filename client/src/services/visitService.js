import api from "./api.js";

// Fire-and-forget — used by useTrackVisit on the public site.
export const recordVisit = (path) => api.post("/visits", { path }).catch(() => {});

export const fetchVisitStats = async () => {
  const { data } = await api.get("/visits/stats");
  return data;
};

// Admin-only, irreversible — see server/controllers/visitController.js.
export const resetVisits = async () => {
  const { data } = await api.delete("/visits");
  return data;
};
