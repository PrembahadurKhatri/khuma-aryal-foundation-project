import api from "./api.js";

export const fetchNotices = async () => {
  const { data } = await api.get("/notices");
  return data;
};

// payload: { titleEn, titleNe, date, priority, attachmentFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "attachmentFile") form.append("attachment", value);
    else form.append(key, value);
  });
  return form;
};

export const createNotice = async (payload) => {
  const { data } = await api.post("/notices", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateNotice = async (id, payload) => {
  const { data } = await api.put(`/notices/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteNotice = async (id) => {
  const { data } = await api.delete(`/notices/${id}`);
  return data;
};
