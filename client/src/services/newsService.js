import api from "./api.js";

export const fetchNews = async () => {
  const { data } = await api.get("/news");
  return data;
};

// payload: { titleEn, titleNe, descriptionEn, descriptionNe, date, imageFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "imageFile") form.append("image", value);
    else form.append(key, value);
  });
  return form;
};

export const createNews = async (payload) => {
  const { data } = await api.post("/news", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateNews = async (id, payload) => {
  const { data } = await api.put(`/news/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteNews = async (id) => {
  const { data } = await api.delete(`/news/${id}`);
  return data;
};
