import { createContext, useEffect, useState } from "react";
import api, { setAccessToken } from "../services/api.js";

export const AuthContext = createContext(null);

// The refreshToken cookie itself is httpOnly (unreadable from JS by design),
// so this is the only client-visible trace of "was this browser ever logged
// in." An anonymous visitor has no refresh cookie to redeem, so their
// /auth/refresh call always 401s -- skipping it entirely on every public
// page load removes one more request from the burst that fires alongside
// the page's real data fetches (leaders/projects/news/etc), without
// changing anything for an admin who's actually logged in.
const SESSION_FLAG = "kaf_had_session";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attempt silent login via refresh cookie on first load -- only if there's
  // reason to think one exists.
  useEffect(() => {
    if (localStorage.getItem(SESSION_FLAG) !== "1") {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        const me = await api.get("/auth/me");
        setUser(me.data.data);
      } catch {
        setUser(null);
        localStorage.removeItem(SESSION_FLAG);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.data);
    localStorage.setItem(SESSION_FLAG, "1");
    return data.data;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(SESSION_FLAG);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};
