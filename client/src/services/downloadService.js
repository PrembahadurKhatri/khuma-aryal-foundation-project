import api from "./api.js";

export const fetchDownloads = async () => {
  const { data } = await api.get("/downloads");
  return data;
};

// payload: { titleEn, titleNe, type, date, fileFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "fileFile") form.append("file", value);
    else form.append(key, value);
  });
  return form;
};

export const createDownload = async (payload) => {
  const { data } = await api.post("/downloads", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateDownload = async (id, payload) => {
  const { data } = await api.put(`/downloads/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteDownload = async (id) => {
  const { data } = await api.delete(`/downloads/${id}`);
  return data;
};
