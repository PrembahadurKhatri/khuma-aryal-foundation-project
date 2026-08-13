import api from "./api.js";

export const fetchGalleryImages = async () => {
  const { data } = await api.get("/gallery");
  return data;
};

// payload: { altEn, altNe, imageFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "imageFile") form.append("image", value);
    else form.append(key, value);
  });
  return form;
};

export const createGalleryImage = async (payload) => {
  const { data } = await api.post("/gallery", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateGalleryImage = async (id, payload) => {
  const { data } = await api.put(`/gallery/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteGalleryImage = async (id) => {
  const { data } = await api.delete(`/gallery/${id}`);
  return data;
};
