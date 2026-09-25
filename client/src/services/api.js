import axios from "axios";

// Strip any trailing slash so this can't produce a double slash regardless
// of how VITE_API_TARGET is set. Exported so contentService.js's withId()
// can resolve locally-stored-upload paths ("/uploads/...", relative to
// this origin, not the frontend's) against the same origin used for every
// other API call.
export const API = (import.meta.env.VITE_API_TARGET || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API}/api`,
  withCredentials: true, // send httpOnly cookies (refreshToken)
  // Without this, a request that hangs (dropped connection, server never
  // responds) never settles at all -- useContent.js's `loading` state stays
  // true forever, which a bare `loading || !data` render check shows as an
  // endless skeleton with no way to recover short of a manual page reload.
  // 20s gives real margin over the slowest cold-start responses seen in
  // practice (5-10s) while still eventually surfacing a hung request as a
  // retryable error instead of hanging silently.
  timeout: 20000,
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    // Cloudflare's Cache Rule for the public JSON routes (leaders/news/...)
    // matches on exact URI path only -- it has no concept of the
    // Authorization header, so an admin's own GET request was being served
    // straight from Cloudflare's shared edge cache, same as any public
    // visitor's, even right after the admin's own write. The server already
    // skips its own cache for an authenticated request (see
    // middleware/cache.js), but that logic never even runs if Cloudflare
    // answers from the edge before the request reaches origin. A random
    // query param makes every admin GET a unique URL that can never match
    // the Cache Rule's exact-path condition, so it always reaches origin.
    if ((config.method || "get").toLowerCase() === "get") {
      config.params = { ...config.params, _admin: Date.now() };
    }
  }
  return config;
});

// Automatically refresh the access token once on a 401, then retry the request.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
      originalRequest._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
