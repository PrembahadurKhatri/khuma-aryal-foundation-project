import api from "./api.js";

// Public — used by About.jsx's contact form.
export const submitMessage = async ({ name, email, subject, message }) => {
  const { data } = await api.post("/messages", { name, email, subject, message });
  return data;
};

// Admin
export const fetchMessages = async (params = {}) => {
  const { data } = await api.get("/messages", { params });
  return data;
};

export const updateMessageStatus = async (id, status) => {
  const { data } = await api.put(`/messages/${id}`, { status });
  return data;
};

export const deleteMessage = async (id) => {
  const { data } = await api.delete(`/messages/${id}`);
  return data;
};
