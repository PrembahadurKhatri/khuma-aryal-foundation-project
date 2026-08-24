import api from "./api.js";

export const loginRequest = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const refreshRequest = async () => {
  const { data } = await api.post("/auth/refresh");
  return data;
};

export const logoutRequest = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const meRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put("/auth/change-password", { currentPassword, newPassword });
  return data;
};

export const changeEmail = async (currentPassword, newEmail) => {
  const { data } = await api.put("/auth/change-email", { currentPassword, newEmail });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
};
